import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const SORT_OPTIONS = [
  { label: 'TOP', value: 'top' },
  { label: 'NEW', value: 'new' },
  { label: 'AUTHOR A-Z', value: 'author_asc' },
  { label: 'AUTHOR Z-A', value: 'author_desc' },
]

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'new'

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:3000/posts?sort=${sort}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load posts.')
        setLoading(false)
      })
  }, [sort])

  async function handleVote(postId, direction) {
    await fetch(`http://localhost:3000/posts/${postId}/${direction}`, {
      method: 'POST',
      credentials: 'include'
    })
    const res = await fetch(`http://localhost:3000/posts?sort=${sort}`, {
      credentials: 'include'
    })
    const data = await res.json()
    setPosts(data.posts)
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main>
      {/* 1. Added className="site-nav" and active class logic */}
      <nav className="site-nav">
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setSearchParams({ sort: option.value })}
            className={sort === option.value ? 'active' : ''}
          >
            {option.label}
          </button>
        ))}
      </nav>

      {/* 2. Added className="post-list" */}
      <ol className="post-list">
        {posts.map((post, i) => {
          const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
          const hasUpvoted = (post.upvotes || []).map(String).includes(String(user?._id))
          const hasDownvoted = (post.downvotes || []).map(String).includes(String(user?._id))

          return (
            <li className="post-card" key={post._id} data-id={post._id}>
              {/* 3. Added className="rank" */}
              <div className="rank"># {String(i + 1).padStart(2, '0')}</div>

              {/* 4. Added className="voting-col" and vote-btn classes */}
              <div className="voting-col">
                <button 
                  onClick={() => handleVote(post._id, 'upvote')} 
                  disabled={hasUpvoted}
                  className={`up vote-btn ${hasUpvoted ? 'voted-up' : ''}`}
                  title="upvote"
                >
                  ▲
                </button>
                
                <span className="score">{score}</span>
                
                <button 
                  onClick={() => handleVote(post._id, 'downvote')} 
                  disabled={hasDownvoted}
                  className={`down vote-btn ${hasDownvoted ? 'voted-down' : ''}`}
                  title="downvote"
                >
                  ▼
                </button>
              </div>

              {post.imageURL && (
                <Link to={`/posts/${post._id}`} className="post-thumbnail-link">
                  <img src={post.imageURL} className="post-thumbnail" alt={post.title} loading="lazy" />
                </Link>
              )}

              {/* 5. Added className="post-body" and sub-classes */}
              <div className="post-body">
                <Link to={`/posts/${post._id}`} className="post-title">{post.title}</Link>
                
                <div className="post-sub">
                  <span>
                    <Link to={`/profile/${post.author}`} className="author">@{post.author}</Link>
                  </span>
                  <span className="dot">·</span>
                  <span className="time">{new Date(post.createdAt).toDateString()}</span>
                  <span className="dot">·</span>
                  <Link to={`/posts/${post._id}#comments`} className="comments-link">
                    {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </main>
  )
}