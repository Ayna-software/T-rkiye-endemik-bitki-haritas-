import sqlite3

conn = sqlite3.connect('users.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
sql = '''SELECT id, plant_name, region_id, user_note, username FROM user_plants WHERE plant_name LIKE '%aaa%' OR plant_name='aaa' ORDER BY id DESC'''
rows = list(cur.execute(sql))
if not rows:
    print('NONE')
else:
    for row in rows:
        print(row['id'], row['plant_name'], row['region_id'], row['user_note'], row['username'])
conn.close()
