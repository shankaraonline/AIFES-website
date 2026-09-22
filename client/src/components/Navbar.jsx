import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/research',      label: 'Research' },
  { to: '/education',     label: 'Education' },
  { to: '/reading-group', label: 'Reading Group' },
  { to: '/events',        label: 'Events & Updates' },
  { to: '/about',         label: 'About Us' },
  { to: '/contact',       label: 'Contact Us' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
            <img src="/AIFES_logo.png" alt="AIFES Logo" className="navbar-logo" />
          </NavLink>

          <ul className="navbar-links">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            className={`navbar-hamburger${open ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(o => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`navbar-mobile${open ? ' open' : ''}`}>
        <div className="navbar-mobile-brand">
          <img src="/AIFES_logo.png" alt="AIFES Logo" className="navbar-logo" />
          <span style={{ fontWeight: 700 }}>AIFES · IIT Hyderabad</span>
        </div>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </>
  )
}
