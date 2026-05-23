import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    inviter: '',
    vcode: ''
  })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors(data.errors || [data.error])
        return
      }

      navigate('/login')
    } catch (err) {
      setErrors(['Something went wrong. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Register</h1>

      {errors.length > 0 && (
        <ul>
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <h2>Verification</h2>

        <div>
          <label htmlFor="inviter">Inviting User</label>
          <input
            type="text"
            id="inviter"
            name="inviter"
            value={formData.inviter}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="vcode">Verification Code</label>
          <input
            type="text"
            id="vcode"
            name="vcode"
            value={formData.vcode}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </main>
  )
}