from pathlib import Path
import sqlite3
from contextlib import closing
import json
import os
import re
from urllib import error, request as urlrequest

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "users.db"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL", "https://generativelanguage.googleapis.com"
).strip()

app = Flask(__name__)
CORS(app)


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with closing(get_db_connection()) as connection:
        with connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS user_plants (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    plant_name TEXT NOT NULL,
                    latin_name TEXT NOT NULL,
                    family TEXT NOT NULL,
                    endemism_status TEXT NOT NULL,
                    user_note TEXT NOT NULL,
                    region_id TEXT NOT NULL,
                    username TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )


init_db()


def cleanup_placeholder_plant() -> None:
    with closing(get_db_connection()) as connection:
        with connection:
            connection.execute(
                "DELETE FROM user_plants WHERE plant_name = ? AND region_id = ?",
                ('aaa', 'karadeniz'),
            )


cleanup_placeholder_plant()


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return normalized.strip("-") or "yeni-bitki"


def fetch_plant_metadata_from_ai(plant_name: str) -> dict[str, str] | None:
    if not GEMINI_API_KEY:
        return None

    base_url = GEMINI_API_URL.rstrip("/")
    endpoint = (
        f"{base_url}/v1/models/gemini-2.5-flash:generateContent"
        f"?key={GEMINI_API_KEY}"
    )
    prompt = (
        "Aşağıdaki bitki adı için sadece JSON döndür. "
        "Alanlar: latin_name, family, endemism_status. "
        "Bitki bulunamazsa endemism_status alanına 'Bilinmiyor' yaz.\n\n"
        f"Bitki adı: {plant_name}"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 500},
    }

    req = urlrequest.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlrequest.urlopen(req, timeout=20) as response:
            raw = response.read().decode("utf-8")
            parsed = json.loads(raw)
    except (error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    try:
        model_text = parsed["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return None

    # Model bazen JSON etrafına metin ekleyebilir.
    match = re.search(r"\{[\s\S]*\}", model_text)
    if not match:
        return None

    try:
        metadata = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

    latin_name = str(metadata.get("latin_name", "")).strip()
    family = str(metadata.get("family", "")).strip()
    endemism_status = str(metadata.get("endemism_status", "")).strip()

    if not latin_name or not family or not endemism_status:
        return None

    return {
        "latin_name": latin_name,
        "family": family,
        "endemism_status": endemism_status,
    }


@app.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not username or not email or not password:
        return jsonify({"message": "Tüm alanları doldurunuz."}), 400

    password_hash = generate_password_hash(password)

    try:
        with closing(get_db_connection()) as connection:
            with connection:
                connection.execute(
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                    (username, email, password_hash),
                )
    except sqlite3.IntegrityError:
        return jsonify({"message": "Bu e-posta ile kayıtlı bir hesap zaten var."}), 409

    return (
        jsonify({"message": "Kayıt başarılı. Giriş yapıldı.", "username": username}),
        201,
    )


@app.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"message": "E-posta ve şifre zorunludur."}), 400

    with closing(get_db_connection()) as connection:
        user = connection.execute(
            "SELECT id, username, email, password FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"message": "E-posta veya şifre hatalı."}), 401

    return jsonify({"message": "Giriş başarılı.", "username": user["username"]}), 200


@app.get("/plants")
@app.get("/api/plants")
def get_user_plants():
    region_id = (request.args.get("region_id") or "").strip()
    if not region_id:
        return jsonify({"message": "region_id zorunludur."}), 400

    with closing(get_db_connection()) as connection:
        rows = connection.execute(
            """
            SELECT
                id,
                plant_name,
                latin_name,
                family,
                endemism_status,
                user_note,
                region_id,
                username,
                created_at
            FROM user_plants
            WHERE region_id = ?
            ORDER BY id DESC
            """,
            (region_id,),
        ).fetchall()

    plants = [
        {
            "id": row["id"],
            "plant_name": row["plant_name"],
            "latin_name": row["latin_name"],
            "family": row["family"],
            "endemism_status": row["endemism_status"],
            "user_note": row["user_note"],
            "region_id": row["region_id"],
            "username": row["username"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]
    return jsonify({"plants": plants}), 200


@app.post("/add-plant")
@app.post("/api/add-plant")
def add_plant():
    data = request.get_json(silent=True) or {}
    plant_name = (data.get("plantName") or "").strip()
    user_note = (data.get("note") or "").strip()
    region_id = (data.get("regionId") or "").strip()
    username = (data.get("username") or "").strip()

    if not plant_name or not user_note or not region_id or not username:
        return jsonify({"message": "Tüm alanlar zorunludur."}), 400

    metadata = fetch_plant_metadata_from_ai(plant_name)
    ai_enrichment_used = metadata is not None
    if metadata is None:
        metadata = {
            "latin_name": plant_name,
            "family": "Bilinmiyor",
            "endemism_status": "Bilinmiyor",
        }

    with closing(get_db_connection()) as connection:
        with connection:
            cursor = connection.execute(
                """
                INSERT INTO user_plants (
                    plant_name, latin_name, family, endemism_status,
                    user_note, region_id, username
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    plant_name,
                    metadata["latin_name"],
                    metadata["family"],
                    metadata["endemism_status"],
                    user_note,
                    region_id,
                    username,
                ),
            )
            created_id = cursor.lastrowid

    return (
        jsonify(
            {
                "message": "Yeni bitki kaydı başarıyla eklendi.",
                "ai_enrichment_used": ai_enrichment_used,
                "plant": {
                    "id": created_id,
                    "slug": slugify(plant_name),
                    "plant_name": plant_name,
                    "latin_name": metadata["latin_name"],
                    "family": metadata["family"],
                    "endemism_status": metadata["endemism_status"],
                    "user_note": user_note,
                    "region_id": region_id,
                    "username": username,
                },
            }
        ),
        201,
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
