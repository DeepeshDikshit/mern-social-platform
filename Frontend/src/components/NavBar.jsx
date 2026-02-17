import { NavLink } from 'react-router-dom'

const linkStyle = ({ isActive }) => ({
  padding: '8px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? 'var(--button-text)' : 'var(--text)',
  background: isActive ? 'var(--button-bg)' : 'transparent',
})

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="brand">N22 Social</div>
      <div className="links">
        <NavLink to="/home" style={linkStyle}>Home</NavLink>
        <NavLink to="/chat" style={linkStyle}>Chat</NavLink>
        <NavLink to="/conversation" style={linkStyle}>Conversation</NavLink>
        <NavLink to="/create-post" style={linkStyle}>Create Post</NavLink>
        <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
        <NavLink to="/user-search" style={linkStyle}>User Search</NavLink>
        <NavLink to="/login" style={linkStyle}>Login</NavLink>
        <NavLink to="/register" style={linkStyle}>Register</NavLink>
      </div>
    </nav>
  )
}
