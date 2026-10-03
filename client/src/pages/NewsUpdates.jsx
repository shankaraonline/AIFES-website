import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'

const API = import.meta.env.VITE_API_URL || '/api/posts'

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

function truncateWords(text, limit = 20) {
  if (!text) return { text: '', isTruncated: false }
  const words = text.trim().split(/\s+/)
  if (words.length <= limit) {
    return { text, isTruncated: false }
  }
  return {
    text: words.slice(0, limit).join(' ') + '…',
    isTruncated: true,
  }
}

export default function NewsUpdates() {
  const [news, setNews] = useState(() => {
    try {
      const cached = localStorage.getItem('aifes_cached_news')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return DEFAULT_NEWS
  })
  const [fetched, setFetched] = useState(true)
  const [expandedIds, setExpandedIds] = useState({})
  const location = useLocation()

  const toggleNews = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((p) => p.tag === 'news' && p.published !== false)
          setNews(filtered)
          try {
            localStorage.setItem('aifes_cached_news', JSON.stringify(filtered))
          } catch {}
        }
        setFetched(true)
      })
      .catch(() => {
        setFetched(true)
      })
  }, [])

  useEffect(() => {
    if (location.hash) {
      const rawId = location.hash.replace('#', '')
      const newsId = rawId.startsWith('news-') ? rawId.replace('news-', '') : rawId
      if (newsId) {
        setExpandedIds((prev) => ({
          ...prev,
          [newsId]: true,
        }))
      }
      const timer = setTimeout(() => {
        const el = document.getElementById(rawId) || document.getElementById(`news-${newsId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('highlight-item')
          setTimeout(() => el.classList.remove('highlight-item'), 2500)
        }
      }, 200)
      return () => clearTimeout(timer)
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
        bgPosition="center 38%"
        titleId="news-heading"
        className="news-hero"
      />

      <section id="news-section" className="outreach-page-section">
        <div className="section-inner" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
          <div className="outreach-listing-header">
            <p className="section-label" style={{ justifyContent: 'center' }}>Lab Announcements</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Latest News &amp; Updates</h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: '960px' }}>
              Follow our latest research publications, awards, collaborations, and official lab announcements.
            </p>
          </div>

          <div className="outreach-items-grid">
            {!fetched ? (
              <p className="en-loading" style={{ textAlign: 'center' }}>Loading news…</p>
            ) : news.length === 0 ? (
              <p className="en-empty" style={{ textAlign: 'center' }}>No news updates published yet.</p>
            ) : (
              news.map((item) => {
                const descText = item.description || item.summary || ''
                const truncatedDesc = truncateWords(descText, 20)
                const isExpanded = !!expandedIds[item.id]
                const hasOtherContent = Boolean(item.link)
                const needsToggle = truncatedDesc.isTruncated || hasOtherContent

                return (
                  <article className="outreach-card" id={`news-${item.id}`} key={item.id}>
                    {/* Highlighted Date badge like in Events */}
                    <div style={{ marginBottom: '14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          background: 'rgba(212, 28, 48, 0.1)',
                          color: '#d41c30',
                          border: '1px solid rgba(212, 28, 48, 0.25)',
                          borderRadius: '99px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        📅 {formatDate(item.date)}
                      </span>
                    </div>

                    <h3 className="outreach-card-title">{item.title}</h3>

                    {/* Additional Info */}
                    {descText && (
                      <div style={{ marginTop: '10px', marginBottom: isExpanded ? '14px' : '4px' }}>
                        <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', fontWeight: 700, marginBottom: '6px' }}>
                          Additional Info
                        </h4>
                        <p className="outreach-card-desc" style={{ whiteSpace: 'pre-line' }}>
                          {isExpanded ? descText : truncatedDesc.text}
                        </p>
                      </div>
                    )}

                    {/* Know More / Show Less Toggle Button */}
                    {needsToggle && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          className="card-toggle-btn"
                          onClick={() => toggleNews(item.id)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <>
                              <span>Show Less</span>
                              <span aria-hidden="true">↑</span>
                            </>
                          ) : (
                            <>
                              <span>Know More</span>
                              <span aria-hidden="true">→</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Expanded Link */}
                    {isExpanded && item.link && (
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
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
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
