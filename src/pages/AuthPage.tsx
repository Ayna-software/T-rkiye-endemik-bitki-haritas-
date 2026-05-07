import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthMode = 'login' | 'register'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_USER_STORAGE_KEY = 'auth_username'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
    const payload =
      mode === 'login'
        ? { email, password }
        : { username, email, password }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = (await response.json()) as { message?: string; username?: string }

      if (!response.ok) {
        setIsError(true)
        setMessage(data.message ?? 'İşlem başarısız oldu.')
        return
      }

      setIsError(false)
      setMessage(data.message ?? 'İşlem başarıyla tamamlandı.')

      const resolvedUsername = data.username ?? username.trim()
      localStorage.setItem(AUTH_USER_STORAGE_KEY, resolvedUsername)

      setTimeout(() => navigate('/'), 800)
    } catch {
      setIsError(true)
      setMessage('Sunucuya bağlanılamadı. Flask servisini kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLMainElement>) => {
    if (event.target === event.currentTarget) {
      navigate('/')
    }
  }

  return (
    <main className="auth-page" onClick={handleBackdropClick}>
      <section className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            type="button"
            onClick={() => {
              setMode('login')
              setMessage('')
              setIsError(false)
            }}
          >
            Giriş Yap
          </button>
          <button
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            type="button"
            onClick={() => {
              setMode('register')
              setMessage('')
              setIsError(false)
            }}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label className="auth-field">
              Kullanıcı Adı
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                minLength={3}
              />
            </label>
          )}

          <label className="auth-field">
            E-posta
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            Şifre
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Bekleyin...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {message && (
          <p className={isError ? 'auth-message error' : 'auth-message success'}>
            {message}
          </p>
        )}
      </section>
    </main>
  )
}
