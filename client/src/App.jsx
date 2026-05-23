import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Header from './components/Header'
import Footer from './components/Footer'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PostsPage from './pages/PostsPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import InvitePage from './pages/InvitePage'
import UserTreePage from './pages/UserTreePage'
import CreatePostPage from './pages/CreatePostPage'
import PostDetailPage from './pages/PostDetailPage'
import UpdateProfilePage from './pages/UpdateProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PostsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts" element={<Navigate to="/" replace />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/update" element={<ProtectedRoute><UpdateProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/invite" element={<ProtectedRoute><InvitePage /></ProtectedRoute>} />
          <Route path="/usertree" element={<UserTreePage />} />
          <Route path="/posts/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="/posts/:postId/edit" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}