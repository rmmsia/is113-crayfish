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
      <nav>
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setSearchParams({ sort: option.value })}
            style={{ fontWeight: sort === option.value ? 'bold' : 'normal' }}
          >
            {option.label}
          </button>
        ))}
      </nav>

      <ol>
        {posts.map((post, i) => {
          const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
          const hasUpvoted = (post.upvotes || []).map(String).includes(String(user._id))
          const hasDownvoted = (post.downvotes || []).map(String).includes(String(user._id))

          return (
            <li key={post._id}>
              <div>#{String(i + 1).padStart(2, '0')}</div>

              <div>
                <button onClick={() => handleVote(post._id, 'upvote')} disabled={hasUpvoted}>▲</button>
                <span>{score}</span>
                <button onClick={() => handleVote(post._id, 'downvote')} disabled={hasDownvoted}>▼</button>
              </div>

              {post.imageURL && (
                <Link to={`/posts/${post._id}`}>
                  <img src={post.imageURL} alt={post.title} loading="lazy" />
                </Link>
              )}

              <div>
                <Link to={`/posts/${post._id}`}>{post.title}</Link>
                <div>
                  <Link to={`/profile/${post.author}`}>@{post.author}</Link>
                  <span> · </span>
                  <span>{new Date(post.createdAt).toDateString()}</span>
                  <span> · </span>
                  <Link to={`/posts/${post._id}#comments`}>
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