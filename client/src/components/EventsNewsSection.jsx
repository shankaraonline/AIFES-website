import { useState, useEffect } from 'react'

const API = 'http://localhost:5000/api/posts'

const DEFAULT_POSTS = [
  {
    id: '1',
    title: 'AIFES Annual Symposium 2026',
    tag: 'event',
    date: '2026-09-15',
  },
  {
    id: '2',
    title: 'New Paper Published in Nature Finance',
    tag: 'news',
    date: '2026-09-10',
  },
  {
    id: '3',
    title: 'Workshop: AI in Regulatory Compliance',
    tag: 'event',
    date: '2026-09-05',
  },
  {
    id: '4',
    title: 'Dr. Sharma receives Best Research Award',
    tag: 'news',
    date: '2026-08-28',
  },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EventsNewsSection({ isPage = false }) {
  const [posts, setPosts] = useState([])
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error('Network response not ok')
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data)
        } else {
          setPosts(DEFAULT_POSTS)
        }
        setFetched(true)
      })
      .catch(() => {
        setPosts(DEFAULT_POSTS)
        setFetched(true)
      })
  }, [])

  const events = posts.filter((p) => p.tag === 'event')
  const news = posts.filter((p) => p.tag === 'news')

  return (
    <section id="events-news" className={isPage ? 'page-offset' : ''}>
      <div className="section-inner">
        <p className="section-label">Latest from AIFES</p>
        <h2 className="section-title">Events &amp; Updates</h2>
        {isPage && (
          <p className="section-sub">
            Stay updated with our upcoming seminars, workshops, announcements, and research milestones.
          </p>
        )}

        <div className="en-grid">
          {/* ── Events Column ── */}
          <div className="en-col">
            <div className="en-col-head">
              <span className="en-col-dot en-dot-event" />
              Events
            </div>

            {!fetched ? (
              <p className="en-loading">Loading…</p>
            ) : events.length === 0 ? (
              <p className="en-empty">No upcoming events.</p>
            ) : (
              events.map((p) => (
                <div className="en-card" key={p.id}>
                  <div className="en-card-title">{p.title}</div>
                  <div className="en-card-date">{formatDate(p.date)}</div>
                </div>
              ))
            )}
          </div>

          {/* ── News & Updates Column ── */}
          <div className="en-col">
            <div className="en-col-head">
              <span className="en-col-dot en-dot-news" />
              News &amp; Updates
            </div>

            {!fetched ? (
              <p className="en-loading">Loading…</p>
            ) : news.length === 0 ? (
              <p className="en-empty">No news yet.</p>
            ) : (
              news.map((p) => (
                <div className="en-card" key={p.id}>
                  <div className="en-card-title">{p.title}</div>
                  <div className="en-card-date">{formatDate(p.date)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
