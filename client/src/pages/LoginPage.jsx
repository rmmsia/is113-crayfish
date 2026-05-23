import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

async function safeJson(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

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

    let data
    try {
      data = await res.json()
    } catch {
      data = null
    }
    console.log('login response:', res.status, data)

    if (!res.ok) {
      setError(data?.error ?? `Login failed (${res.status})`)
      return
    }

    // Try to get user data from login response first
    if (data?.user) {
      setUser(data.user)
      navigate('/posts', { replace: true })
      return
    }

    // If no user data in login response, try /auth/me
    try {
      const meRes = await fetch('/auth/me', {
        credentials: 'include'
      })
      const meData = meRes.ok ? await meRes.json() : null
      console.log('me response:', meRes.status, meData)

      if (meRes.ok && meData?.user) {
        setUser(meData.user)
        navigate('/posts', { replace: true })
      } else {
        // If /auth/me fails but login succeeded, still redirect
        // The AuthProvider's useEffect will handle auth check on page load
        navigate('/posts', { replace: true })
        // Force a small delay to ensure cookie is set, then reload
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (err) {
      console.error('Error fetching /auth/me:', err)
      // Still redirect on network error
      navigate('/posts', { replace: true })
    }
  } catch (err) {
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <main>
      <h1>Login</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>Forgot password? Reset <Link to="/forgot-password">here</Link>.</p>
      <p>Don't have an account? <Link to="/register">here</Link>.</p>
    </main>
  )
}