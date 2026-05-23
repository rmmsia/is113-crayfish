import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { applyOptimisticVote } from '../utils/voteUtils'
import LoginModal from '../components/LoginModal'

export default function PostDetailPage() {
  const { postId: id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    const res = await fetch(`/posts/${id}`, { credentials: 'include' })
    const data = await res.json()
    if (res.ok) setPost(data.post)
  }

  const handleVote = async (direction) => {
    if (!user || !post) { setShowLoginModal(true); return }

    setPost(prev => applyOptimisticVote(prev, direction, user._id))

    try {
      const res = await fetch(`/posts/${id}/${direction}`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error()
    } catch {
      fetchPost()
      }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) { setShowLoginModal(true); return }
    const res = await fetch(`/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentText: newComment }),
      credentials: 'include'
    })
    if (res.ok) {
      setNewComment('')
      fetchPost()
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return
    await fetch(`/posts/${id}/comments/${commentId}`, { method: 'DELETE', credentials: 'include' })
    fetchPost()
  }

  const handleUpdateComment = async (commentId) => {
    await fetch(`/posts/${id}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedText: editCommentText }),
      credentials: 'include'
    })
    setEditingCommentId(null)
    fetchPost()
  }

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this entire post?")) return
    await fetch(`/posts/${id}`, { method: 'DELETE', credentials: 'include' })
    navigate('/posts')
  }

  if (!post) return <p>Loading...</p>

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
  const hasUpvoted = post.upvotes?.includes(user?._id)
  const hasDownvoted = post.downvotes?.includes(user?._id)

  return (
    <main className="post-page">
      <div className="post-head">
        <div className="voting-col">
          <button className={`up vote-btn ${hasUpvoted ? 'voted-up' : ''}`} onClick={() => handleVote('upvote')}>▲</button>
          <span className="score">{score}</span>
          <button className={`down vote-btn ${hasDownvoted ? 'voted-down' : ''}`} onClick={() => handleVote('downvote')}>▼</button>
        </div>
        <h2 style={{ paddingLeft: '10px' }}>{post.title}</h2>
      </div>

      {post.imageURL && <img className="post-img-expanded" src={post.imageURL} alt={post.title} />}

      <div className="post-body">
        <span className="description">{post.description}</span>
        <div className="post-tags-display">
          {post.tags?.map(tag => <span key={tag._id} className="tag-item">#{tag.name}</span>)}
        </div>

        <div className="post-sub">
          <span>By <Link to={`/profile/${post.author}`}>@{post.author}</Link></span>
          <span className="dot">·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {user?.username === post.author && (
          <div className="post-owner-controls">
            <button onClick={handleDeletePost} className="post-ctrl-btn">Delete</button>
            <span className="dot">·</span>
            <Link to={`/posts/${id}/edit`} className="post-ctrl-btn">Edit Post</Link>
          </div>
        )}

        <hr />
        <h3>{post.comments.length} comments</h3>

        <form onSubmit={handleAddComment}>
          <textarea 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)} 
            placeholder="Write a comment..." 
            required 
          />
          <button type="submit">Post</button>
        </form>

        {[...post.comments].reverse().map(item => (
          <div key={item._id} className="comment-container">
            {editingCommentId === item._id ? (
              <div style={{ marginLeft: '15px' }}>
                <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} />
                <button onClick={() => handleUpdateComment(item._id)}>Save</button>
                <button onClick={() => setEditingCommentId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="comment-field">
                <span style={{ fontWeight: 600 }}>@{item.author}:</span>
                <p>{item.text}</p>
                {user?.username === item.author && (
                  <div className="comment-buttons">
                    <button onClick={() => {
                      setEditingCommentId(item._id)
                      setEditCommentText(item.text)
                    }}>Edit</button>
                    <button onClick={() => handleDeleteComment(item._id)}>Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </main>
  )
}