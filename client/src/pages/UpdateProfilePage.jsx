import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function UpdateProfilePage() {
  const [about, setAbout] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch current profile data to fill the textarea
    fetch('/profile/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setAbout(data.user.about || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/profile/update', {
        method: 'PATCH', // Matches your backend route
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about }),
        credentials: 'include'
      })

      if (res.ok) {
        // Redirect back to the personal profile page
        navigate('/profile')
      } else {
        alert("Failed to update profile")
      }
    } catch (err) {
      console.error("Update error:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: '1em' }}>
      <h1>Edit About</h1>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="about">About:</label><br />
        <textarea 
          name="about" 
          id="about" 
          rows="10" 
          cols="80"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Tell us about yourself..."
        /><br />
        
        <button type="submit" disabled={saving}>
          {saving ? 'Updating...' : 'Update'}
        </button>
      </form>

      <br />
      <Link to="/profile">← Back to profile</Link>
    </div>
  )
}