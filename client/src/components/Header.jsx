import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="header">
      <Link to="/posts" className="logo">Crayfish</Link>
      <div className="nav-div">
        {user ? (
          <>
            <Link to="/posts/create">+ Create Post</Link>
            <Link to="/profile">Profile</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  )
}