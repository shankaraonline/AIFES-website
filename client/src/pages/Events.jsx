import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/posts' : 'http://localhost:5000/api/posts')

const DEFAULT_EVENTS = [
  {
    id: '1',
    title: 'AIFES Annual Symposium 2026',
    tag: 'event',
    date: '2026-09-15',
    overview: 'A premier gathering of industry leaders, quantitative researchers, and academicians exploring the frontier of AI in capital markets.',
    hosts: 'AIFES Lab, Department of AI, IIT Hyderabad',
    location: 'IIT Hyderabad Campus & Online (Hybrid)',
    schedules: [{ date: '2026-09-15', time: '10:00 AM - 05:00 PM IST' }],
    hasGuests: true,
    guests: [
      {
        name: 'Prof. Easwar Subramanian',
        designation: 'Faculty — IIT Hyderabad',
        image: 'https://ai-iith-web.github.io/AIFES/assets/img/Easwar-Subramanian.jpg',
        linkedin: 'https://linkedin.com',
      },
      {
        name: 'Prof. Ganesh Ghalme',
        designation: 'Faculty — IIT Hyderabad',
        image: 'https://ai-iith-web.github.io/AIFES/assets/img/Ganesh-IITH.jpg',
        linkedin: 'https://sites.google.com/view/ganeshghalme/home?authuser=',
      }
    ],
    published: true,
  },
  {
    id: '3',
    title: 'Workshop: AI in Regulatory Compliance',
    tag: 'event',
    date: '2026-09-05',
    overview: 'Hands-on technical workshop on building deployable RegTech pipelines and algorithmic monitoring tools.',
    hosts: 'AIFES Research Group',
    location: 'Auditorium 2, Academic Block A, IIT Hyderabad',
    schedules: [{ date: '2026-09-05', time: '02:00 PM - 05:30 PM IST' }],
    hasGuests: false,
    guests: [],
    published: true,
  },
]

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function LinkedInIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  )
}

export default function Events() {
  const [events, setEvents] = useState([])
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
          const filtered = data.filter((p) => p.tag === 'event' && p.published !== false)
          setEvents(filtered.length > 0 ? filtered : DEFAULT_EVENTS)
        } else {
          setEvents(DEFAULT_EVENTS)
        }
        setFetched(true)
      })
      .catch(() => {
        setEvents(DEFAULT_EVENTS)
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
  }, [location.pathname, location.hash, events])

  return (
    <div className="page-offset events-page">
      <PageHero
        label="Outreach"
        title="Events & Workshops"
        subtitle="Symposia, seminars, industry panels, and academic workshops hosted by AIFES Lab at IIT Hyderabad."
        bgImage="/events_hero.jpg"
        bgPosition="center 30%"
        titleId="events-heading"
        className="events-hero"
      />

      <section id="events-section" className="outreach-page-section">
        <div className="section-inner" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
          <div className="outreach-listing-header">
            <p className="section-label" style={{ justifyContent: 'center' }}>Academic &amp; Industry</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Upcoming &amp; Past Events</h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
              Explore our scheduled symposia, specialized masterclasses, and interactive panel sessions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1000px', margin: '0 auto' }}>
            {!fetched ? (
              <p className="en-loading" style={{ textAlign: 'center' }}>Loading events…</p>
            ) : events.length === 0 ? (
              <p className="en-empty" style={{ textAlign: 'center' }}>No upcoming events scheduled right now.</p>
            ) : (
              events.map((item) => {
                const schedules = Array.isArray(item.schedules) && item.schedules.length > 0
                  ? item.schedules
                  : [{ date: item.date, time: '' }]
                const guests = Array.isArray(item.guests) ? item.guests : []

                return (
                  <article
                    className="event-rich-card"
                    id={`event-${item.id}`}
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* Event Banner (1920 x 1080 px aspect) */}
                    {item.banner && (
                      <div style={{ width: '100%', maxHeight: '360px', overflow: 'hidden', background: '#0f172a' }}>
                        <img
                          src={item.banner}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}

                    <div style={{ padding: '28px clamp(20px, 4vw, 36px)' }}>
                      {/* Top Meta: Dates & Location */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                        {schedules.map((sch, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              background: 'rgba(217, 119, 6, 0.1)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(217, 119, 6, 0.25)',
                              borderRadius: '99px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            📅 {formatDate(sch.date)}{sch.time ? ` · ${sch.time}` : ''}
                          </span>
                        ))}

                        {item.location && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              background: '#f8fafc',
                              color: 'var(--text-2)',
                              border: '1px solid var(--border)',
                              borderRadius: '99px',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            📍 {item.location}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          color: 'var(--text-1)',
                          marginBottom: '16px',
                        }}
                      >
                        {item.title}
                      </h3>

                      {/* Event Overview */}
                      {(item.overview || item.description || item.summary) && (
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', fontWeight: 700, marginBottom: '6px' }}>
                            Event Overview
                          </h4>
                          <p style={{ color: 'var(--text-2)', fontSize: '0.96rem', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                            {item.overview || item.description || item.summary}
                          </p>
                        </div>
                      )}

                      {/* About the event hosts */}
                      {item.hosts && (
                        <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px' }}>
                          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-1)', fontWeight: 700, marginBottom: '4px' }}>
                            About the Event Hosts
                          </h4>
                          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                            {item.hosts}
                          </p>
                        </div>
                      )}

                      {/* Event Guests */}
                      {item.hasGuests && guests.length > 0 && (
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Event Guests &amp; Speakers</span>
                            <span style={{ fontSize: '11px', background: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '99px' }}>
                              {guests.length}
                            </span>
                          </h4>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                            {guests.map((g, gIdx) => (
                              <div
                                key={gIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  background: '#fafafa',
                                  border: '1px solid var(--border)',
                                  borderRadius: '10px',
                                }}
                              >
                                {g.image ? (
                                  <img
                                    src={g.image}
                                    alt={g.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '50%',
                                      background: 'rgba(217, 119, 6, 0.1)',
                                      color: 'var(--accent)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '18px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    👤
                                  </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {g.name}
                                  </div>
                                  {g.designation && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {g.designation}
                                    </div>
                                  )}
                                  {g.linkedin && (
                                    <a
                                      href={g.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#0077b5',
                                        fontSize: '0.78rem',
                                        textDecoration: 'none',
                                        marginTop: '4px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      <LinkedInIcon size={13} /> LinkedIn
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
