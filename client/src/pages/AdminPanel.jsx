import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/posts' : 'http://localhost:5000/api/posts')

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('outreach') // 'education' | 'reading-group' | 'outreach'
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('event')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchPosts = async () => {
    try {
      const res = await fetch(API)
      const data = await res.json()
      setPosts(data)
    } catch {
      setError('Could not connect to server. Make sure the backend is running on port 5000.')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!title.trim()) { setError('Title cannot be empty.'); return }
    setLoading(true)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, tag }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setTitle('')
      setSuccess('Post added successfully!')
      await fetchPosts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add post.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      await fetchPosts()
    } catch {
      setError('Failed to delete post.')
    }
  }

  const events = posts.filter(p => p.tag === 'event')
  const news   = posts.filter(p => p.tag === 'news')

  return (
    <div className="admin-dashboard-container">
      {/* ── Admin Top Navigation Bar ─────────────────────────────── */}
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          {/* Left: Logo */}
          <div className="admin-nav-left">
            <Link to="/admin" className="admin-nav-brand">
              <img src="/AIFES_logo.png" alt="AIFES Lab" className="admin-nav-logo" />
            </Link>
          </div>

          {/* Center: Admin Label */}
          <div className="admin-nav-center">
            <h1 className="admin-nav-title">Admin</h1>
          </div>

          {/* Right: Link back to main website */}
          <div className="admin-nav-right">
            <Link to="/" className="admin-nav-site-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Admin Body: Sidebar + Main Content ───────────────────── */}
      <div className="admin-body">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <p className="admin-sidebar-heading">Services</p>
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
              </button>

              {/* 3. Outreach */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'outreach' ? 'active' : ''}`}
                onClick={() => setActiveTab('outreach')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Outreach</span>
                {posts.length > 0 && (
                  <span className="admin-nav-badge">{posts.length}</span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="admin-main">
          {/* ───────────────── 1. EDUCATION SECTION ───────────────── */}
          {activeTab === 'education' && (
            <div className="admin-tab-pane">
              <div className="admin-header">
                <span className="admin-badge">Service Management</span>
                <h2 className="admin-title">Education</h2>
                <p className="admin-subtitle">
                  Manage course offerings, academic materials, and program curricula reflecting directly on the Education page.
                </p>
              </div>

              {/* Notice Box */}
              <div className="admin-notice-box">
                <div className="admin-notice-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div>
                  <h4 className="admin-notice-title">Custom Fields Configuration Ready</h4>
                  <p className="admin-notice-text">
                    You will be mentioning the specific fields for this section next. Once provided, these input fields will be wired up to dynamically save and reflect across your frontend <strong>Education</strong> page.
                  </p>
                </div>
              </div>

              {/* Education Placeholder Card */}
              <div className="admin-card">
                <h3 className="admin-card-title">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Education Service Fields (Ready to Add)
                </h3>
                <div className="admin-placeholder-fields">
                  <div className="admin-field">
                    <label className="admin-label">Course / Program Title</label>
                    <input className="admin-input" type="text" placeholder="Title field will be configured here..." disabled />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Course Description / Summary</label>
                    <textarea className="admin-input admin-textarea" rows={3} placeholder="Description field will be configured here..." disabled />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Additional Custom Fields</label>
                    <div className="admin-slot-prompt">
                      <span>Ready for your upcoming fields (e.g. Instructor, Syllabus Link, Level, Prerequisites, etc.)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── 2. READING GROUPS SECTION ───────────────── */}
          {activeTab === 'reading-group' && (
            <div className="admin-tab-pane">
              <div className="admin-header">
                <span className="admin-badge">Service Management</span>
                <h2 className="admin-title">Reading Groups</h2>
                <p className="admin-subtitle">
                  Manage reading group sessions, research papers, discussion schedules, and student presentations reflecting directly on the Reading Group page.
                </p>
              </div>

              {/* Notice Box */}
              <div className="admin-notice-box">
                <div className="admin-notice-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div>
                  <h4 className="admin-notice-title">Custom Fields Configuration Ready</h4>
                  <p className="admin-notice-text">
                    You will be mentioning the specific fields for this section next. Once provided, these input fields will be wired up to dynamically save and reflect across your frontend <strong>Reading Group</strong> page.
                  </p>
                </div>
              </div>

              {/* Reading Group Placeholder Card */}
              <div className="admin-card">
                <h3 className="admin-card-title">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Reading Group Service Fields (Ready to Add)
                </h3>
                <div className="admin-placeholder-fields">
                  <div className="admin-field">
                    <label className="admin-label">Paper / Discussion Topic</label>
                    <input className="admin-input" type="text" placeholder="Topic field will be configured here..." disabled />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Presenter / Speaker</label>
                    <input className="admin-input" type="text" placeholder="Presenter field will be configured here..." disabled />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Additional Custom Fields</label>
                    <div className="admin-slot-prompt">
                      <span>Ready for your upcoming fields (e.g. Schedule, Meeting Link, Paper PDF URL, Slides, etc.)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── 3. OUTREACH SECTION ───────────────── */}
          {activeTab === 'outreach' && (
            <div className="admin-tab-pane">
              <div className="admin-header">
                <span className="admin-badge">Service Management</span>
                <h2 className="admin-title">Outreach</h2>
                <p className="admin-subtitle">
                  Manage Events and News &amp; Updates displayed on the Home page, Events page, and News page.
                </p>
              </div>

              {/* Add Post Form */}
              <div className="admin-card">
                <h3 className="admin-card-title">Add New Outreach Post</h3>
                <form className="admin-form" onSubmit={handleSubmit}>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="post-title">Title</label>
                    <input
                      id="post-title"
                      className="admin-input"
                      type="text"
                      placeholder="Enter post title..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      maxLength={120}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Tag</label>
                    <div className="admin-tag-group">
                      <label className={`admin-tag-option${tag === 'event' ? ' selected' : ''}`}>
                        <input
                          type="radio"
                          name="tag"
                          value="event"
                          checked={tag === 'event'}
                          onChange={() => setTag('event')}
                        />
                        <span className="tag-dot tag-dot-event" /> Event
                      </label>
                      <label className={`admin-tag-option${tag === 'news' ? ' selected' : ''}`}>
                        <input
                          type="radio"
                          name="tag"
                          value="news"
                          checked={tag === 'news'}
                          onChange={() => setTag('news')}
                        />
                        <span className="tag-dot tag-dot-news" /> News &amp; Update
                      </label>
                    </div>
                  </div>
                  {error   && <p className="admin-msg admin-msg-error">{error}</p>}
                  {success && <p className="admin-msg admin-msg-success">{success}</p>}
                  <button className="admin-submit" type="submit" disabled={loading}>
                    {loading ? 'Adding…' : '+ Add Post'}
                  </button>
                </form>
              </div>

              {/* All Posts List */}
              <div className="admin-card">
                <h3 className="admin-card-title">
                  All Active Posts
                  <span className="admin-count">{posts.length}</span>
                </h3>

                {posts.length === 0 ? (
                  <p className="admin-empty">No posts yet. Add one above.</p>
                ) : (
                  <div className="admin-posts-cols">
                    {/* Events column */}
                    <div>
                      <p className="admin-col-head">
                        <span className="tag-dot tag-dot-event" /> Events ({events.length})
                      </p>
                      {events.length === 0
                        ? <p className="admin-empty-col">No events.</p>
                        : events.map(p => (
                          <div className="admin-post-row" key={p.id}>
                            <div>
                              <div className="admin-post-title">{p.title}</div>
                              <div className="admin-post-date">{formatDate(p.date)}</div>
                            </div>
                            <button
                              className="admin-delete"
                              onClick={() => handleDelete(p.id)}
                              title="Delete"
                              aria-label="Delete post"
                            >×</button>
                          </div>
                        ))}
                    </div>

                    {/* News column */}
                    <div>
                      <p className="admin-col-head">
                        <span className="tag-dot tag-dot-news" /> News &amp; Updates ({news.length})
                      </p>
                      {news.length === 0
                        ? <p className="admin-empty-col">No news.</p>
                        : news.map(p => (
                          <div className="admin-post-row" key={p.id}>
                            <div>
                              <div className="admin-post-title">{p.title}</div>
                              <div className="admin-post-date">{formatDate(p.date)}</div>
                            </div>
                            <button
                              className="admin-delete"
                              onClick={() => handleDelete(p.id)}
                              title="Delete"
                              aria-label="Delete post"
                            >×</button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
