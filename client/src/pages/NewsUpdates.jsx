import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/posts' : 'http://localhost:5000/api/posts')

const DEFAULT_NEWS = [
  {
    id: '2',
    title: 'New Paper Published in Nature Finance',
    tag: 'news',
    date: '2026-09-10',
    summary: 'AIFES researchers publish landmark findings on AI-driven financial market microstructure and systemic risk modelling.',
  },
  {
    id: '4',
    title: 'Dr. Sharma receives Best Research Award',
    tag: 'news',
    date: '2026-08-28',
    summary: 'Recognized for pioneering contributions to trustworthy AI and algorithmic fairness in Indian credit markets.',
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

export default function NewsUpdates() {
  const [news, setNews] = useState([])
  const [fetched, setFetched] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter((p) => p.tag === 'news' && p.published !== false)
          setNews(filtered.length > 0 ? filtered : DEFAULT_NEWS)
        } else {
          setNews(DEFAULT_NEWS)
        }
        setFetched(true)
      })
      .catch(() => {
        setNews(DEFAULT_NEWS)
        setFetched(true)
      })
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('highlight-item')
          setTimeout(() => el.classList.remove('highlight-item'), 2500)
        }, 150)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.hash, news])

  return (
    <div className="page-offset news-page">
      <PageHero
        label="Outreach"
        title="News & Updates"
        subtitle="Research breakthroughs, announcements, media coverage, and lab achievements from AIFES."
        bgImage="/news_hero.jpg"
        bgPosition="center 30%"
        titleId="news-heading"
        className="news-hero"
      />

      <section id="news-section" className="outreach-page-section">
        <div className="section-inner" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
          <div className="outreach-listing-header">
            <p className="section-label" style={{ justifyContent: 'center' }}>Lab Announcements</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Latest News &amp; Updates</h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
              Follow our latest research publications, awards, collaborations, and official lab announcements.
            </p>
          </div>

          <div className="outreach-items-grid">
            {!fetched ? (
              <p className="en-loading" style={{ textAlign: 'center' }}>Loading news…</p>
            ) : news.length === 0 ? (
              <p className="en-empty" style={{ textAlign: 'center' }}>No news updates published yet.</p>
            ) : (
              news.map((item) => (
                <article className="outreach-card" id={`news-${item.id}`} key={item.id}>
                  {/* Highlighted Date badge like in Events (No redundant 'News' tag) */}
                  <div style={{ marginBottom: '14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: 'rgba(217, 119, 6, 0.1)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(217, 119, 6, 0.25)',
                        borderRadius: '99px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      📅 {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 className="outreach-card-title">{item.title}</h3>
                  {(item.description || item.summary) && (
                    <p className="outreach-card-desc">{item.description || item.summary}</p>
                  )}

                  {item.link && (
                    <div style={{ marginTop: '14px' }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          color: 'var(--accent)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        🔗 View Reference / Link ↗
                      </a>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
