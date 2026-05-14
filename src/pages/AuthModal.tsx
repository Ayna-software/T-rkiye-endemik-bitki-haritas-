import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

type AuthMode = 'login' | 'register'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_USER_STORAGE_KEY = 'auth_username'

interface AuthModalProps {
  onClose: () => void
  onSuccess: (username: string) => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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

      setTimeout(() => {
        onSuccess(resolvedUsername)
      }, 800)
    } catch {
      setIsError(true)
      setMessage('Sunucuya bağlanılamadı. Flask servisini kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = () => {
    onSuccess('Misafir')
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--split">
        <div className="auth-hero">
          <span className="auth-hero__eyebrow">Türkiye Endemik Bitki Haritası</span>
          <h1 className="auth-hero__title">Doğayı keşfet, bitkileri incele, katkı bırak.</h1>
          <p className="auth-hero__text">
            Haritaya giriş yaparak bölgelere göre endemik bitkileri keşfedebilir veya
            misafir olarak hızlıca gezinebilirsiniz.
          </p>
          <div className="auth-hero__stats">
            <div>
              <strong>81</strong>
              <span>il keşfi</span>
            </div>
            <div>
              <strong>2 mod</strong>
              <span>giriş / kayıt</span>
            </div>
            <div>
              <strong>1 tık</strong>
              <span>misafir erişimi</span>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className={`auth-tabs auth-tabs--${mode}`}>
            <div className="auth-tabs__thumb" aria-hidden="true" />
            <button
              className={mode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'}
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
              className={mode === 'register' ? 'auth-tab auth-tab--active' : 'auth-tab'}
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

          <form className={`auth-form auth-form--${mode}`} onSubmit={onSubmit}>
            <div className="auth-form__fields">
              <label className={`auth-field ${mode === 'login' ? 'auth-field--ghost' : ''}`}>
                Kullanıcı Adı
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required={mode === 'register'}
                  minLength={3}
                  tabIndex={mode === 'login' ? -1 : 0}
                  aria-hidden={mode === 'login'}
                />
              </label>

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
            </div>

            <div className={`auth-form__actions auth-form__actions--split`}>
              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Bekleyin...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>

              {mode === 'login' ? (
                <button className="auth-guest-btn" type="button" onClick={handleGuestLogin}>
                  Misafir olarak devam et
                </button>
              ) : (
                <div className="auth-guest-btn auth-guest-btn--ghost" aria-hidden="true" />
              )}
            </div>
          </form>

          {message && (
            <p className={isError ? 'auth-message error' : 'auth-message success'}>
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
