import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

async function safeJson(res) {
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

export function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })
      const data = await safeJson(res)

      if (!res.ok) {
        setError(data?.error ?? `Login failed (${res.status})`)
        return
      }

      if (data?.user) {
        setUser(data.user)
        onSuccess?.()
        return
      }

      const meRes = await fetch('/auth/me', { credentials: 'include' })
      const meData = meRes.ok ? await safeJson(meRes) : null
      if (meRes.ok && meData?.user) {
        setUser(meData.user)
        onSuccess?.()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link>.</p>
    </>
  )
}

export default function LoginModal({ onClose }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Login</h2>
        <LoginForm onSuccess={onClose} />
      </div>
    </div>,
    document.body
  )
}