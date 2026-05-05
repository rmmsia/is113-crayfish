import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <Link to="/about">About</Link>
      <Link to="/tags">Tags</Link>
    </footer>
  )
}