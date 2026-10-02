import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  POSTS_API,
  READING_API,
  FACULTY_API,
  STUDENTS_API,
  COURSES_API,
  clearToken,
  authFetch,
} from './admin/adminUtils'

import EducationAdmin from './admin/EducationAdmin'
import ReadingGroupAdmin from './admin/ReadingGroupAdmin'
import EventsAdmin from './admin/EventsAdmin'
import NewsAdmin from './admin/NewsAdmin'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('education') // 'education' | 'reading-group' | 'events' | 'news'
  const [counts, setCounts] = useState({
    education: 0,
    readingGroup: 0,
    events: 0,
    news: 0,
  })

  const fetchCounts = async () => {
    try {
      const [resPosts, resMat, resCourses, resFaculty, resStudents] = await Promise.all([
        authFetch(`${POSTS_API}?includeDrafts=true`).then(r => r.json()).catch(() => []),
        authFetch(READING_API).then(r => r.json()).catch(() => []),
        authFetch(COURSES_API).then(r => r.json()).catch(() => []),
        authFetch(FACULTY_API).then(r => r.json()).catch(() => []),
        authFetch(STUDENTS_API).then(r => r.json()).catch(() => []),
      ])

      const posts = Array.isArray(resPosts) ? resPosts : []
      const mats = Array.isArray(resMat) ? resMat : []
      const courses = Array.isArray(resCourses) ? resCourses : []
      const faculty = Array.isArray(resFaculty) ? resFaculty : []
      const students = Array.isArray(resStudents) ? resStudents : []

      setCounts({
        education: courses.length,
        readingGroup: mats.length + faculty.length + students.length,
        events: posts.filter(p => p.tag === 'event').length,
        news: posts.filter(p => p.tag === 'news').length,
      })
    } catch {
      // Ignored - individual tabs handle error display
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  const handleDataChange = (section, newCount) => {
    setCounts(prev => {
      if (section === 'education') return { ...prev, education: newCount }
      if (section === 'reading-group') return { ...prev, readingGroup: newCount }
      if (section === 'events') return { ...prev, events: newCount }
      if (section === 'news') return { ...prev, news: newCount }
      return prev
    })
  }

  const handleLogout = () => {
    clearToken()
    navigate('/admin-login', { replace: true })
  }

  return (
    <div className="admin-dashboard-container">
      {/* ── Admin Top Navigation Bar ─────────────────────────────── */}
      <header className="admin-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <img src="/iith_logo.png" alt="IIT Hyderabad" className="navbar-logo navbar-iith-logo" />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" className="admin-nav-site-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Website</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Sign out"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
            <div className="navbar-right-brand" style={{ margin: 0 }}>
              <div className="navbar-sp-wrap">
                <img src="/SP_Global_Logo.jpg" alt="S&P Global" className="navbar-sp-logo" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Admin Body: Sidebar + Main Content ───────────────────── */}
      <div className="admin-body">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <div
              className="admin-sidebar-heading"
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--text-1)',
                marginBottom: '1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Dashboard
            </div>
            <nav className="admin-sidebar-nav">
              {/* 1. Education */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Education</span>
                {counts.education > 0 && <span className="admin-nav-badge">{counts.education}</span>}
              </button>

              {/* 2. Reading Groups */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'reading-group' ? 'active' : ''}`}
                onClick={() => setActiveTab('reading-group')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Reading Groups</span>
                {counts.readingGroup > 0 && (
                  <span className="admin-nav-badge">{counts.readingGroup}</span>
                )}
              </button>

              {/* 3. Events */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Events</span>
                {counts.events > 0 && <span className="admin-nav-badge">{counts.events}</span>}
              </button>

              {/* 4. News & Updates */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => setActiveTab('news')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>News &amp; Updates</span>
                {counts.news > 0 && <span className="admin-nav-badge">{counts.news}</span>}
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="admin-main">
          {activeTab === 'education' && <EducationAdmin onDataChange={handleDataChange} />}
          {activeTab === 'reading-group' && <ReadingGroupAdmin onDataChange={handleDataChange} />}
          {activeTab === 'events' && <EventsAdmin onDataChange={handleDataChange} />}
          {activeTab === 'news' && <NewsAdmin onDataChange={handleDataChange} />}
        </main>
      </div>
    </div>
  )
}
