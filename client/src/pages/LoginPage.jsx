import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginModal'

export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <main>
      <h1>Login</h1>
      <LoginForm onSuccess={() => navigate('/', { replace: true })} />
    </main>
  )
}