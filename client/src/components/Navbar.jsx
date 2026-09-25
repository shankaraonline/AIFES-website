import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/research',      label: 'Research' },
  { to: '/education',     label: 'Education' },
  { to: '/reading-group', label: 'Reading Group' },
  { to: '/outreach',      label: 'Outreach' },
  { to: '/about',         label: 'About Us' },
  { to: '/contact',       label: 'Contact Us' },
]

import { researchThemes as researchSections } from '../data/researchThemes'

const outreachSections = [
  { name: 'Events', to: '/events' },
  { name: 'News & Updates', to: '/news' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [outreachDropdownOpen, setOutreachDropdownOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState(true)
  const [mobileOutreachOpen, setMobileOutreachOpen] = useState(true)
  const location = useLocation()

  const handleThemeClick = (id) => {
    setDropdownOpen(false)
    setOpen(false)
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
    if (location.pathname === '/research') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleResearchMainClick = () => {
    setDropdownOpen(false)
    setOpen(false)
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
    if (location.pathname === '/research' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
            <img src="/AIFES_logo.png" alt="AIFES Logo" className="navbar-logo" />
          </NavLink>

          <ul className="navbar-links">
            {links.map(({ to, label }) => {
              if (to === '/research') {
                return (
                  <li
                    key={to}
                    className="nav-dropdown"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setDropdownOpen(false)
                      }
                    }}
                  >
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `nav-link-with-caret${isActive || location.pathname === '/research' ? ' active' : ''}`
                      }
                      onClick={handleResearchMainClick}
                    >
                      <span>{label}</span>
                      <svg
                        className={`nav-dropdown-caret${dropdownOpen ? ' open' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="14"
                        height="14"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </NavLink>

                    <div className={`nav-dropdown-menu${dropdownOpen ? ' visible' : ''}`}>
                      <ul className="nav-dropdown-list">
                        {researchSections.map(section => (
                          <li key={section.id}>
                            <Link
                              to={`/research#${section.id}`}
                              className="nav-dropdown-item"
                              onClick={() => handleThemeClick(section.id)}
                            >
                              {section.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              }

              if (to === '/outreach') {
                const isOutreachActive =
                  location.pathname === '/events' ||
                  location.pathname === '/news' ||
                  location.pathname === '/news-updates' ||
                  location.pathname === '/outreach'

                return (
                  <li
                    key={to}
                    className="nav-dropdown"
                    onMouseEnter={() => setOutreachDropdownOpen(true)}
                    onMouseLeave={() => setOutreachDropdownOpen(false)}
                    onFocus={() => setOutreachDropdownOpen(true)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setOutreachDropdownOpen(false)
                      }
                    }}
                  >
                    <NavLink
                      to="/events"
                      className={`nav-link-with-caret${isOutreachActive ? ' active' : ''}`}
                      onClick={() => {
                        setOutreachDropdownOpen(false)
                        setOpen(false)
                        if (document.activeElement && typeof document.activeElement.blur === 'function') {
                          document.activeElement.blur()
                        }
                      }}
                    >
                      <span>{label}</span>
                      <svg
                        className={`nav-dropdown-caret${outreachDropdownOpen ? ' open' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="14"
                        height="14"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </NavLink>

                    <div className={`nav-dropdown-menu${outreachDropdownOpen ? ' visible' : ''}`}>
                      <ul className="nav-dropdown-list">
                        {outreachSections.map(section => (
                          <li key={section.to}>
                            <Link
                              to={section.to}
                              className="nav-dropdown-item"
                              onClick={() => {
                                setOutreachDropdownOpen(false)
                                setOpen(false)
                                if (document.activeElement && typeof document.activeElement.blur === 'function') {
                                  document.activeElement.blur()
                                }
                              }}
                            >
                              {section.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              }

              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {label}
                  </NavLink>
                </li>
              )
            })}
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
        {links.map(({ to, label }) => {
          if (to === '/research') {
            return (
              <div key={to} className="navbar-mobile-item-group">
                <div className="navbar-mobile-row">
                  <NavLink
                    to={to}
                    className={({ isActive }) => (isActive || location.pathname === '/research' ? 'active' : '')}
                    onClick={() => {
                      setOpen(false)
                      handleResearchMainClick()
                    }}
                  >
                    {label}
                  </NavLink>
                  <button
                    type="button"
                    className={`navbar-mobile-caret-btn${mobileSubOpen ? ' open' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMobileSubOpen(v => !v)
                    }}
                    aria-label="Toggle Research sub-themes"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {mobileSubOpen && (
                  <div className="navbar-mobile-submenu">
                    {researchSections.map(section => (
                      <Link
                        key={section.id}
                        to={`/research#${section.id}`}
                        className="navbar-mobile-subitem"
                        onClick={() => handleThemeClick(section.id)}
                      >
                        {section.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (to === '/outreach') {
            const isOutreachActive =
              location.pathname === '/events' ||
              location.pathname === '/news' ||
              location.pathname === '/news-updates' ||
              location.pathname === '/outreach'

            return (
              <div key={to} className="navbar-mobile-item-group">
                <div className="navbar-mobile-row">
                  <NavLink
                    to="/events"
                    className={isOutreachActive ? 'active' : ''}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </NavLink>
                  <button
                    type="button"
                    className={`navbar-mobile-caret-btn${mobileOutreachOpen ? ' open' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMobileOutreachOpen(v => !v)
                    }}
                    aria-label="Toggle Outreach sub-items"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {mobileOutreachOpen && (
                  <div className="navbar-mobile-submenu">
                    {outreachSections.map(section => (
                      <Link
                        key={section.to}
                        to={section.to}
                        className="navbar-mobile-subitem"
                        onClick={() => setOpen(false)}
                      >
                        {section.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          )
        })}
      </div>
    </>
  )
}
