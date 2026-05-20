import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function InvitePage() {
  const [inviteList, setInviteList] = useState([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Track specific email edits for each row in the table
  const [editEmails, setEditEmails] = useState({})

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const res = await fetch('http://localhost:3000/invite', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setInviteList(data.inviteList)
    } catch (err) {
      console.error("Failed to fetch invites")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('http://localhost:3000/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setInviteList(data.inviteList)
      setEmail('') // Clear input on success
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (code) => {
    const newEmail = editEmails[code]
    if (!newEmail) return

    try {
      const res = await fetch(`http://localhost:3000/invite/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        setInviteList(data.inviteList)
        // Clear the specific edit field
        setEditEmails(prev => ({ ...prev, [code]: '' }))
      }
    } catch (err) {
      alert("Failed to update invite")
    }
  }

  const handleRetract = async (code) => {
    if (!window.confirm("Are you sure you want to retract this invite?")) return

    try {
      const res = await fetch(`http://localhost:3000/invite/${code}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setInviteList(data.inviteList)
    } catch (err) {
      alert("Failed to retract invite")
    }
  }

  if (loading) return <p>Loading invites...</p>

  return (
    <div style={{ padding: '1em' }}>
      <h1>Invite a Friend</h1>
      <form onSubmit={handleGenerate}>
        <p>To create an invitation, please enter the email of the person you would like to invite.</p>
        
        <label htmlFor="email">Email: </label>
        <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <br /><br />
        <button type="submit">Generate an invite link</button>
      </form>

      {inviteList.length > 0 && (
        <>
          <h2>Invites</h2>
          <table border="1" className="invite-table">
            <thead>
              <tr>
                <th>InviteID</th>
                <th>Status</th>
                <th>Invited User</th>
                <th>Invitee Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inviteList.map((invitation) => (
                <tr key={invitation.code}>
                  <td>{invitation.code}</td>
                  <td>{invitation.status}</td>
                  <td>
                    {invitation.usedBy && (
                      <Link to={`/profile/${invitation.usedBy}`}>{invitation.usedBy}</Link>
                    )}
                  </td>
                  <td>{invitation.targetEmail}</td>
                  <td>
                    {invitation.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <input 
                          type="email" 
                          placeholder="New email"
                          value={editEmails[invitation.code] || ''}
                          onChange={(e) => setEditEmails({
                            ...editEmails, 
                            [invitation.code]: e.target.value 
                          })}
                        />
                        <button onClick={() => handleUpdate(invitation.code)}>Update</button>
                        <button onClick={() => handleRetract(invitation.code)} style={{ color: 'red' }}>
                          Retract
                        </button>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}