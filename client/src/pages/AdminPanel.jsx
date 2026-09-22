import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/posts'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminPanel() {
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
    <div className="page-offset admin-page">
      <div className="admin-inner">

        {/* Header */}
        <div className="admin-header">
          <p className="section-label">Internal Tool</p>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">
            Manage Events and News &amp; Updates displayed on the Home page and the Events &amp; Updates page.
          </p>
        </div>

        {/* Add Post Form */}
        <div className="admin-card">
          <h2 className="admin-card-title">Add New Post</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="post-title">Title</label>
              <input
                id="post-title"
                className="admin-input"
                type="text"
                placeholder="Enter title..."
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

        {/* Posts List */}
        <div className="admin-card">
          <h2 className="admin-card-title">
            All Posts
            <span className="admin-count">{posts.length}</span>
          </h2>

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
    </div>
  )
}
