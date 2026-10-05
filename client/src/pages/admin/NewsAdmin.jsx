import { useState, useEffect } from 'react'
import { POSTS_API, formatDate, authFetch, DateInput } from './adminUtils'

export default function NewsAdmin({ onDataChange }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Add Form State ──
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newsTitle, setNewsTitle] = useState('')
  const [newsDesc, setNewsDesc] = useState('')
  const [newsLink, setNewsLink] = useState('')

  // ── In-Place Edit Modal State ──
  const [editingNewsItem, setEditingNewsItem] = useState(null)
  const [editNewsDate, setEditNewsDate] = useState('')
  const [editNewsTitle, setEditNewsTitle] = useState('')
  const [editNewsDesc, setEditNewsDesc] = useState('')
  const [editNewsLink, setEditNewsLink] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchNews = async () => {
    try {
      const res = await authFetch(`${POSTS_API}?includeDrafts=true`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPosts(data)
        const newsItems = data.filter(p => p.tag === 'news')
        if (typeof onDataChange === 'function') {
          onDataChange('news', newsItems.length)
        }
        try {
          const publishedNews = data.filter(p => p.tag === 'news' && p.published !== false)
          localStorage.setItem('aifes_cached_news', JSON.stringify(publishedNews))
          localStorage.removeItem('aifes_cached_posts')
        } catch {}
      }
    } catch {
      setError('Could not fetch news. Ensure server is running.')
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  // ── Add News Handler ──
  const handleAddNews = async (shouldPublish) => {
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
      const res = await authFetch(POSTS_API, {
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
      setNewsDate(new Date().toISOString().split('T')[0])
      setNewsTitle('')
      setNewsDesc('')
      setNewsLink('')
      await fetchNews()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Open Edit Modal ──
  const handleOpenEditNews = (item) => {
    setEditingNewsItem(item)
    setEditNewsDate(item.date || new Date().toISOString().split('T')[0])
    setEditNewsTitle(item.title || '')
    setEditNewsDesc(item.description || '')
    setEditNewsLink(item.link || '')
    setError('')
  }

  const handleCloseEditNews = () => {
    setEditingNewsItem(null)
    setEditNewsDate('')
    setEditNewsTitle('')
    setEditNewsDesc('')
    setEditNewsLink('')
  }

  // ── Save Edited News ──
  const handleSaveEditNews = async (shouldPublish) => {
    if (!editNewsTitle.trim()) {
      setError('News Heading is required.')
      return
    }

    setLoading(true)
    setError('')

    const payload = {
      title: editNewsTitle.trim(),
      tag: 'news',
      date: editNewsDate || new Date().toISOString().split('T')[0],
      description: editNewsDesc.trim(),
      link: editNewsLink.trim(),
      published: shouldPublish,
    }

    try {
      const res = await authFetch(`${POSTS_API}/${editingNewsItem.id}`, {
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
      handleCloseEditNews()
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
      const res = await authFetch(`${POSTS_API}/${item.id}`, {
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
      await authFetch(`${POSTS_API}/${id}`, { method: 'DELETE' })
      notifySuccess('News item removed.')
      if (editingNewsItem?.id === id) handleCloseEditNews()
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

      {/* News List (Top Section) */}
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
          <p className="admin-empty">No news updates posted yet. Use the form below to add news.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {news.map((item) => {
              const isEditing = editingNewsItem?.id === item.id

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card, #ffffff)',
                      border: '2px solid #d41c30',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                          EDITING NEWS
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{item.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEditNews}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                        title="Cancel editing"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEditNews(true); }}>
                      <div className="admin-field">
                        <label className="admin-label">Date (DD-MM-YYYY) *</label>
                        <DateInput
                          value={editNewsDate}
                          onChange={(e) => setEditNewsDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">News Heading / Title *</label>
                        <input
                          className="admin-input"
                          type="text"
                          value={editNewsTitle}
                          onChange={(e) => setEditNewsTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Summary / Description</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={4}
                          value={editNewsDesc}
                          onChange={(e) => setEditNewsDesc(e.target.value)}
                        />
                      </div>

                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Link (Optional)</label>
                        <input
                          className="admin-input"
                          type="url"
                          placeholder="https://..."
                          value={editNewsLink}
                          onChange={(e) => setEditNewsLink(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleCloseEditNews}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '99px',
                            border: '1px solid var(--border)',
                            background: '#ffffff',
                            color: 'var(--text-2)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditNews(false)}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '99px',
                            border: '1px solid var(--border)',
                            background: '#f8fafc',
                            color: 'var(--text-1)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          disabled={loading}
                        >
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditNews(true)}
                          className="admin-submit"
                          disabled={loading}
                          style={{ margin: 0 }}
                        >
                          {loading ? 'Saving…' : 'Save & Publish'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              }

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
                            background: '#fce8ea',
                            color: '#d41c30',
                            border: '1px solid rgba(212, 28, 48, 0.3)',
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

                    {/* Edit Button: Opens In-Place Modal */}
                    <button
                      type="button"
                      className="admin-btn-edit"
                      onClick={() => handleOpenEditNews(item)}
                      title="Edit News Post"
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="admin-btn-delete"
                      onClick={() => handleDeletePost(item.id)}
                      title="Delete News Post"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>



      {/* Form to Add News and Announcements (Always Clean and Ready) */}
      <div className="admin-card" id="news-admin-card" style={{ marginTop: '32px' }}>
        <h3 className="admin-card-title" style={{ marginBottom: '16px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add News and Announcements
        </h3>

        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleAddNews(true); }}>
          {/* Date */}
          <div className="admin-field">
            <label className="admin-label">Date (DD-MM-YYYY) *</label>
            <DateInput
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
              onClick={() => handleAddNews(false)}
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
              onClick={() => handleAddNews(true)}
              disabled={loading}
              style={{
                background: '#d41c30',
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
                boxShadow: '0 2px 8px rgba(212, 28, 48, 0.25)',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
