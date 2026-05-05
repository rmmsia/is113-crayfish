import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const username = useParams().username
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user: loggedInUser, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true);

    // dynamic profile URL fetching
    const endpoint = username 
      ? `http://localhost:3000/profile/${username}` 
      : `http://localhost:3000/profile/me`;
    

    fetch(endpoint, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setProfileData(data);
        setLoading(false);
      });
  }, [username]);

  const handleLogout = async () => {
    await fetch('http://localhost:3000/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    })
    setUser(null)
    navigate('/login')
  }

  if (loading) return <p>Loading profile...</p>
  if (!profileData) return <p>User not found.</p>

  const { user, totalKarma, totalPosts, totalComments, posts } = profileData
  
  // Check if the profile being viewed is the person currently logged in
  const isUser = loggedInUser && loggedInUser._id === user._id

  // Logic for the possessive 's
  const possessiveName = user.username.endsWith('s') ? `${user.username}'` : `${user.username}'s`

  return (
    <div style={{ padding: '1em' }}>
      <h1>{user.username}</h1>
      
      <p>Joined: {new Date(user.createdAt).toLocaleDateString('en-GB')} by invitation from {user.invitedBy}</p>
      <p>Karma: {totalKarma}</p>
      <p>Posts Submitted: {totalPosts}</p>
      <p>Comments Submitted: {totalComments}</p>
      <p>About: {user.about}</p>

      {isUser ? (
        <section>
          <h2>Settings</h2>
          <p>Email: {user.email}</p>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/profile/update">Update About</Link>
            <Link to="/forgot-password">Reset Password</Link>
            <Link to="/invite">Invite New User</Link>
            <button onClick={handleLogout} style={{ width: 'fit-content' }}>Logout</button>
          </nav>
          <hr />
          <h2>My Posts</h2>
        </section>
      ) : (
        <>
          <hr />
          <h2>{possessiveName} Posts</h2>
        </>
      )}

      <div className="post-list">
        {posts.slice().reverse().map(post => (
          <div key={post._id} className="post-card" style={{ marginBottom: '2em' }}>
            {post.imageURL && (
              <Link to={`/posts/${post._id}`} className="post-thumbnail-link">
                <img className="post-thumbnail" src={post.imageURL} alt={post.title} loading="lazy" />
              </Link>
            )}
            <div className="post-body">
              <Link to={`/posts/${post._id}`} className="post-title" style={{ display: 'block', fontWeight: 'bold' }}>
                {post.title}
              </Link>
              <div className="post-sub">
                <span className="time">{new Date(post.createdAt).toDateString()}</span>
                <span className="dot"> · </span>
                <Link to={`/posts/${post._id}#comments`} className="comments-link">
                  {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}