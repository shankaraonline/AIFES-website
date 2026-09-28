import { useState, useEffect } from 'react'
import { POSTS_API, formatDate } from './adminUtils'

export default function NewsAdmin({ onDataChange }) {
  const [posts, setPosts] = useState([])
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newsTitle, setNewsTitle] = useState('')
  const [newsDesc, setNewsDesc] = useState('')
  const [newsLink, setNewsLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchNews = async () => {
    try {
      const res = await fetch(`${POSTS_API}?includeDrafts=true`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPosts(data)
        const newsItems = data.filter(p => p.tag === 'news')
        if (typeof onDataChange === 'function') {
          onDataChange('news', newsItems.length)
        }
      }
    } catch {
      setError('Could not connect to news database.')
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleEditNews = (item) => {
    setEditingNewsId(item.id)
    setNewsDate(item.date || new Date().toISOString().split('T')[0])
    setNewsTitle(item.title || '')
    setNewsDesc(item.description || '')
    setNewsLink(item.link || '')

    const el = document.getElementById('news-admin-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEditNews = () => {
    setEditingNewsId(null)
    setNewsDate(new Date().toISOString().split('T')[0])
    setNewsTitle('')
    setNewsDesc('')
    setNewsLink('')
  }

  const handleSaveNews = async (shouldPublish) => {
    if (!newsTitle.trim()) {
      setError('News Heading is required.')
      return
    }

    setLoading(true)
    setError('')

    const payload = {
      title: newsTitle.trim(),
      tag: 'news',
      date: newsDate || new Date().toISOString().split('T')[0],
      description: newsDesc.trim(),
      link: newsLink.trim(),
      published: shouldPublish,
    }

    try {
      if (editingNewsId) {
        const res = await fetch(`${POSTS_API}/${editingNewsId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to update news post.')
        }
        notifySuccess(
          `News "${payload.title}" updated and ${shouldPublish ? 'published on website' : 'saved as draft'}!`
        )
      } else {
        const res = await fetch(POSTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to save news post.')
        }
        notifySuccess(
          `News "${payload.title}" ${shouldPublish ? 'published on website' : 'saved as draft'} successfully!`
        )
      }
      handleCancelEditNews()
      await fetchNews()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublishNews = async (item) => {
    try {
      const newStatus = !item.published
      const res = await fetch(`${POSTS_API}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      notifySuccess(
        `News "${item.title}" is now ${newStatus ? 'Published (visible on website)' : 'Saved as Draft'}.`
      )
      await fetchNews()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this news post?')) return
    try {
      await fetch(`${POSTS_API}/${id}`, { method: 'DELETE' })
      notifySuccess('News item removed.')
      if (editingNewsId === id) handleCancelEditNews()
      await fetchNews()
    } catch {
      setError('Failed to delete item.')
    }
  }

  const news = posts.filter(p => p.tag === 'news')

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="admin-title">News &amp; Updates</h2>
        <p className="admin-subtitle">
          Form to Update the News and Announcements across the website.
        </p>
      </div>

      {/* Form to Update the News and Announcements */}
      <div className="admin-card" id="news-admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {editingNewsId ? 'Edit News and Announcements' : 'Form to Update the News and Announcements'}
          </h3>
          {editingNewsId && (
            <button
              type="button"
              onClick={handleCancelEditNews}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleSaveNews(true); }}>
          {/* Date */}
          <div className="admin-field">
            <label className="admin-label">Date *</label>
            <input
              className="admin-input"
              type="date"
              value={newsDate}
              onChange={(e) => setNewsDate(e.target.value)}
              required
            />
          </div>

          {/* Heading */}
          <div className="admin-field">
            <label className="admin-label">Heading *</label>
            <input
              className="admin-input"
              type="text"
              placeholder="News or announcement heading..."
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              required
            />
          </div>

          {/* Additional Info */}
          <div className="admin-field">
            <label className="admin-label">Additional Info</label>
            <textarea
              className="admin-input admin-textarea"
              rows={4}
              placeholder="Additional info, context, or full details..."
              value={newsDesc}
              onChange={(e) => setNewsDesc(e.target.value)}
            />
          </div>

          {/* Reference Links (if any) */}
          <div className="admin-field">
            <label className="admin-label">Reference Links (if any)</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. https://... or paper URL (optional)"
              value={newsLink}
              onChange={(e) => setNewsLink(e.target.value)}
            />
          </div>

          {/* Action buttons: <Save as Draft> and <Publish> */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSaveNews(false)}
              disabled={loading}
              style={{
                background: '#f1f5f9',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveNews(true)}
              disabled={loading}
              style={{
                background: 'var(--accent, #d97706)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              {loading ? 'Publishing…' : (editingNewsId ? 'Save & Publish' : 'Publish')}
            </button>

            {editingNewsId && (
              <button
                type="button"
                onClick={handleCancelEditNews}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <span>All News &amp; Announcements</span>
            <span className="admin-count">{news.length}</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
            Click <strong>Publish</strong> to show on the website, or <strong>Unpublish</strong> to hide.
          </p>
        </div>

        {news.length === 0 ? (
          <p className="admin-empty">No news updates posted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {news.map((item) => {
              const isPublished = item.published !== false

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '14px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      {isPublished ? (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          ● Published
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          ○ Draft (Hidden)
                        </span>
                      )}

                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                        {item.title}
                      </h4>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                      📅 {formatDate(item.date)}
                    </div>

                    {item.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: '4px 0 0', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    )}

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        🔗 {item.link} ↗
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Toggle Publish / Unpublish */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublishNews(item)}
                      style={{
                        background: isPublished ? '#f1f5f9' : '#16a34a',
                        color: isPublished ? '#475569' : '#ffffff',
                        border: isPublished ? '1px solid #cbd5e1' : 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={isPublished ? 'Unpublish and hide from website' : 'Publish and display on website'}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleEditNews(item)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="admin-delete"
                      onClick={() => handleDeletePost(item.id)}
                      title="Delete News Post"
                      style={{ margin: 0 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
