import { useState, useEffect } from 'react'
import PageHero from '../components/PageHero'

const BASE_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/posts\/?$/, '')
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

const FACULTY_API = `${BASE_API}/reading-faculty`
const STUDENTS_API = `${BASE_API}/reading-students`
const MATERIALS_API = `${BASE_API}/reading-materials`

const BASE = 'https://ai-iith-web.github.io/AIFES'

const DEFAULT_MATERIALS = [
  { name: '1. Probability Basics', session: '1. Probability Basics', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/1-probability-basics.pdf' },
  { name: '2. Conditional Expectation', session: '2. Conditional Expectation', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/2-conditional-expectation.pdf' },
  { name: '3. Kolmogorov 0-1 Law', session: '3. Kolmogorov 0-1 Law', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/3-kolmogorov-0-1-law.pdf' },
  { name: '4. Martingales', session: '4. Martingales', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/4-martingales.pdf' },
  { name: '5. Brownian Motion', session: '5. Brownian Motion', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/5-brownian-motion.pdf' },
  { name: '6. Brownian Motion - Part 2', session: '6. Brownian Motion - Part 2', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/6-brownian-motion-part-2.pdf' },
  { name: '7. Ito Calculus and Geometric Brownian Motion', session: '7. Ito Calculus and Geometric Brownian Motion', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/7-ito-calculus-and-geometric-brownian-motion.pdf' },
  { name: '8. Girsanov\'s Theorem and Risk Neutral Measure', session: '8. Girsanov\'s Theorem and Risk Neutral Measure', presenter: 'Faculty & Scholars', material: 'slides/Reading%20Group/8-girsanovs-theorem-and-risk-neutral-measure.pdf' },
]

const DEFAULT_FACULTY = [
  { name: 'Prof. Ganesh Ghalme', designation: 'Faculty — IIT Hyderabad', linkedin: 'https://sites.google.com/view/ganeshghalme/home?authuser=', image: `${BASE}/assets/img/Ganesh-IITH.jpg` },
  { name: 'Prof. V L Raju Chinthalapati', designation: 'Faculty — IIT Hyderabad', linkedin: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/', image: `${BASE}/assets/img/V-L-Raju.png` },
  { name: 'Prof. Phanindra Jampana', designation: 'Faculty — IIT Hyderabad', linkedin: 'https://people.iith.ac.in/pjampana/', image: `${BASE}/assets/img/phanindra.jpg` },
  { name: 'Prof. Karthik PN', designation: 'Faculty — IIT Hyderabad', linkedin: 'https://karthikpn.com/', image: `${BASE}/assets/img/karthikpn.jpg` },
]

const DEFAULT_STUDENTS = [
  { name: 'Vishnuhemanth Tiruvalluru', info: 'M. Tech (RA) · 2024 – Now', linkedin: '' },
  { name: 'Aditya Varun V', info: 'B. Tech · 2022 – Now', linkedin: '' },
  { name: 'Kush Mathukiya', info: 'PhD Student · 2025 – Now', linkedin: '' },
  { name: 'Viswa Kiran VVS', info: 'M. Tech · 2024 – 2026', linkedin: '' },
  { name: 'Akshintala Venkata Mahvith Kusumakar', info: 'M. Tech (RA) · 2023 – 2026', linkedin: '' },
]

function LinkedInIcon({ size = 16 }) {
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

export default function ReadingGroup() {
  const [faculty, setFaculty] = useState(DEFAULT_FACULTY)
  const [students, setStudents] = useState(DEFAULT_STUDENTS)
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS)

  useEffect(() => {
    // 1. Fetch Faculty
    fetch(FACULTY_API)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFaculty(data)
      })
      .catch(() => {})

    // 2. Fetch Students
    fetch(STUDENTS_API)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setStudents(data)
      })
      .catch(() => {})

    // 3. Fetch Materials
    fetch(MATERIALS_API)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMaterials(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page-offset reading-group-page">
      <PageHero
        label="Research Community"
        title="AIFES Research Reading Group"
        subtitle={(
          <>
            A collaborative forum where faculty and students explore the mathematical foundations and research directions in AI for Finance, Economies, and Society.
          </>
        )}
        bgImage="/reading_group_hero.jpg"
        bgPosition="center 30%"
        titleId="reading-group-heading"
        className="reading-group-hero"
      />

      <section id="reading-group" className="reading-group-content-section">
        <div className="section-inner" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
          {/* Centered Second Definition / Lead Intro */}
          <div className="reading-group-intro">
            <p className="reading-group-intro-text">
              The AIFES Reading Group brings together faculty members and students interested in research
              at the intersection of artificial intelligence, financial markets, economic systems, and
              societal impact.
            </p>
          </div>

          {/* Faculty */}
          <div className="reading-group-section-block" style={{ marginTop: '50px' }}>
            <p className="section-label" style={{ justifyContent: 'center', textAlign: 'center' }}>Faculty</p>
            <div className="people-grid" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {faculty.map((f, idx) => (
                <div className="person-card" key={f.id || f.name || idx}>
                  <div className="person-avatar">
                    <img
                      src={f.image || `${BASE}/assets/img/Ganesh-IITH.jpg`}
                      alt={f.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `${BASE}/assets/img/Ganesh-IITH.jpg`
                      }}
                    />
                  </div>
                  <div className="person-name">
                    {f.linkedin ? (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        {f.name}
                        <span style={{ color: '#0077b5', display: 'inline-flex' }}>
                          <LinkedInIcon size={14} />
                        </span>
                      </a>
                    ) : (
                      f.name
                    )}
                  </div>
                  <div className="person-role">{f.designation || f.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Students */}
          <div className="reading-group-section-block" style={{ marginTop: '64px' }}>
            <p className="section-label" style={{ justifyContent: 'center', textAlign: 'center' }}>Students</p>
            <div className="schedule-table-wrap reading-group-table" style={{ marginTop: '24px' }}>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Academic Info</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id || s.name || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {s.image ? (
                            <img
                              src={s.image}
                              alt={s.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                            />
                          ) : null}
                          <span style={{ fontWeight: 500 }}>{s.name}</span>
                        </div>
                      </td>
                      <td>{s.info || s.academicInfo || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {s.linkedin ? (
                          <a
                            href={s.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: 'rgba(0, 119, 181, 0.12)',
                              color: '#0077b5',
                              transition: 'transform 0.2s, background 0.2s',
                              textDecoration: 'none',
                            }}
                            title={`LinkedIn Profile: ${s.name}`}
                          >
                            <LinkedInIcon size={16} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discussion & Overview */}
          <div className="reading-group-overview" style={{ marginTop: '56px' }}>
            <p>
              The group meets regularly and is structured around presentations delivered by a designated
              presenter for each session. These sessions provide an opportunity to study foundational
              concepts, discuss important ideas in quantitative finance and economic systems, and develop
              a deeper understanding of the mathematical and computational tools required for research in
              this area.
            </p>
            <p>
              The discussions focus on core topics such as probability theory, stochastic processes, and
              stochastic calculus, along with their applications in financial modeling and market analysis.
            </p>
            <p>
              Through collaborative discussions and presentations, the reading group aims to cultivate a
              strong research culture and prepare participants to engage with contemporary research problems
              and contribute to the broader research agenda in AI for Finance, Economies, and Society.
            </p>
          </div>

          {/* Materials */}
          <div className="reading-group-section-block" style={{ marginTop: '64px' }}>
            <p className="section-label" style={{ justifyContent: 'center', textAlign: 'center' }}>Materials</p>
            <p className="section-sub" style={{ marginTop: '12px', textAlign: 'center', margin: '12px auto 0' }}>
              Papers, notes, and slides shared during sessions.
            </p>
            <div className="schedule-table-wrap reading-group-table" style={{ marginTop: '24px' }}>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Material</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, idx) => {
                    const title = m.name || m.session || `Session ${idx + 1}`
                    const link = m.material || m.slidesUrl || '#'
                    const desc = m.description || m.presenter || ''
                    return (
                      <tr key={m.id || title || idx}>
                        <td style={{ fontWeight: 500 }}>{title}</td>
                        <td style={{ color: 'var(--muted)' }}>{desc || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          {link && link !== '#' ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                background: 'rgba(217, 119, 6, 0.12)',
                                color: 'var(--accent)',
                                borderRadius: '6px',
                                fontWeight: 500,
                                fontSize: '13px',
                                textDecoration: 'none',
                              }}
                            >
                              Open Link ↗
                            </a>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
