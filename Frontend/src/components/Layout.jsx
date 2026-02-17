import { NavLink, Outlet } from 'react-router-dom'

function Icon({ children }) {
  return (
    <span className="navicon" aria-hidden>
      {children}
    </span>
  )
}

const links = [
  {
    to: '/home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5"/>
        <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
      </svg>
    ),
  },
  {
    to: '/user-search',
    label: 'Search',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-3.6-3.6"/>
      </svg>
    ),
  },
  {
    to: '/create-post',
    label: 'Create',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14"/>
        <path d="M5 12h14"/>
      </svg>
    ),
  },
  {
    to: '/chat',
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21a8 8 0 1 0-16 0"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function Layout() {
  return (
    <div className="layout">
      {/* Desktop sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Primary">
        <div className="brand">N22</div>
        <nav className="navlist">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
              <Icon>{icon}</Icon>
              <span className="navtext">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <main className="content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottomnav" role="navigation" aria-label="Primary">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} aria-label={label}>
            <Icon>{icon}</Icon>
            <span className="navtext">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
