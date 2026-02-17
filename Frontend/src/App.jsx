import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Chat from './pages/Chat.jsx'
import Conversation from './pages/Conversation.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Profile from './pages/Profile.jsx'
import UserSearch from './pages/UserSearch.jsx'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isReady, setIsReady] = useState(false)

  // Initialize on mount and listen for storage changes
  useEffect(() => {
    setIsReady(true)

    // Listen for token changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Real-time token polling for same-tab logout detection
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      setToken(currentToken)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (!isReady) {
    return <div>Loading...</div>
  }

  const isLoggedIn = !!token

  return (
    <div className="app">
      <Routes>
        {/* Root Route: Smart redirect based on authentication */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

        {/* Public Auth Routes (No Layout) */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Register />}
        />

        {/* Protected App Routes (With Layout) */}
        <Route element={<Layout />}>
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" replace />} />
          <Route path="/conversation" element={isLoggedIn ? <Conversation /> : <Navigate to="/login" replace />} />
          <Route path="/create-post" element={isLoggedIn ? <CreatePost /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/user-search" element={isLoggedIn ? <UserSearch /> : <Navigate to="/login" replace />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<h2 style={{ padding: 16 }}>404 - Not Found</h2>} />
      </Routes>
    </div>
  )
}