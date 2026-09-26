import { useState, useEffect } from 'react'
import PageHero from '../components/PageHero'

const BASE_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/posts\/?$/, '')
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

const COURSES_API = `${BASE_API}/courses`

const DEFAULT_COURSE = {
  id: 'default-1',
  title: 'AI in Finance',
  courseId: 'AI4403',
  startDate: 'Aug 2026',
  endDate: 'Nov 2026',
  overview: `This course provides a comprehensive introduction to Artificial Intelligence in Finance by integrating foundational financial concepts, mathematical modelling, and modern machine-learning techniques. This course aims to cover classical financial theory and contemporary AI techniques combined to address asset pricing, trading, portfolio management, risk assessment, and financial decision-making problems. The contents taught in the course include (not limited to) time value of money, financial instruments, derivatives, pricing, stochastic processes, and the Black–Scholes framework before progressing to Monte Carlo methods, volatility modelling, portfolio optimization (Classical Markowitz theory and modern approaches), risk measures, forecasting, backtesting and algorithmic trading.\n\nThe course also examines credit risk and systemic financial risk using methods such as XGBoost and graph neural networks. Advanced modules cover synthetic financial data generation, stress testing, and emerging agentic finance systems.`,
  prerequisites: `Students are expected to have completed the Foundations of Machine Learning (FoML) or Pattern Recognition and Machine Learning (PRML) course. While knowledge of Deep Learning and Reinforcement Learning is desired, it is not a mandatory prerequisite.`,
  instructors: [
    {
      name: 'Prof. Easwar Subramanian',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/Easwar-Subramanian.jpg',
    },
    {
      name: 'Prof. Ganesh Ghalme',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/Ganesh-IITH.jpg',
    },
    {
      name: 'Prof. V L Raju Chinthalapati',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/V-L-Raju.png',
    },
  ],
  materials: [
    { date: '31 Jul 2026', lecture: 'Lecture 0: Introduction to AI in Finance', resources: 'Will update soon', additionalInfo: '—' },
    { date: '6 Aug 2026', lecture: 'Lecture 1: Basic Financial Instruments', resources: 'Will update soon', additionalInfo: '—' },
    { date: '8 Aug 2026', lecture: 'Lecture 2: Binomial Models For Option Pricing', resources: 'Will update soon', additionalInfo: '—' },
    { date: '11 Aug 2026', lecture: 'Lecture 3: Binomial Models For Option Pricing (contd.)', resources: 'Will update soon', additionalInfo: '—' },
  ],
}

function formatCourseMetaDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }
  return dateStr
}

function formatTableDate(dateStr) {
  if (!dateStr) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }
  return dateStr
}

export default function Education() {
  const [courses, setCourses] = useState([DEFAULT_COURSE])
  const [openCourseIds, setOpenCourseIds] = useState({ [DEFAULT_COURSE.id]: true })

  useEffect(() => {
    fetch(COURSES_API)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load courses')
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data)
          // Open the first course by default
          setOpenCourseIds({ [data[0].id]: true })
        }
      })
      .catch(() => {
        // Fallback to default
      })
  }, [])

  const toggleCourse = (id) => {
    setOpenCourseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="page-offset education-page">
      <PageHero
        label="Education & Skilling"
        title="AI for Finance Education Programme"
        subtitle="Modular, applied, and connected to Indian markets from BTech students to C-suite executives."
        bgImage="/education_hero.jpg"
        bgPosition="center 30%"
        titleId="education-heading"
        className="education-hero"
      />

      <section id="education" className="education-content-section">
        <div className="section-inner" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
          {courses.map((course) => {
            const isOpen = !!openCourseIds[course.id]

            return (
              <div
                key={course.id}
                className={`advisory-note${isOpen ? ' open' : ''}`}
                style={{ marginBottom: '32px' }}
              >
                {/* Accordion Summary */}
                <div
                  className="advisory-summary"
                  onClick={() => toggleCourse(course.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleCourse(course.id)}
                >
                  <div>
                    <div className="advisory-title">Credit Course · IIT Hyderabad</div>
                    <div className="advisory-names">
                      <strong>{course.title}</strong> — Semester course.
                    </div>
                    <div className="course-meta">
                      {course.courseId && <span className="tag">{course.courseId}</span>}
                      {(course.startDate || course.endDate) && (
                        <span className="tag">
                          {formatCourseMetaDate(course.startDate)} {course.endDate ? `– ${formatCourseMetaDate(course.endDate)}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`advisory-chevron${isOpen ? ' open' : ''}`} aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="advisory-desc">
                    {/* Course Overview */}
                    {course.overview && (
                      <>
                        <div className="instructors-label">Course Overview</div>
                        {course.overview.split('\n\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </>
                    )}

                    {/* Prerequisites */}
                    {course.prerequisites && (
                      <>
                        <div className="instructors-label">Prerequisites</div>
                        <p>{course.prerequisites}</p>
                      </>
                    )}

                    {/* Instructors */}
                    {course.instructors && course.instructors.length > 0 && (
                      <>
                        <div className="instructors-label">Instructors</div>
                        <div className="course-instructors" style={{ flexWrap: 'wrap', gap: '16px' }}>
                          {course.instructors.map((inst, idx) => (
                            <div
                              key={idx}
                              className="course-instructor"
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <span className="ci-avatar">
                                <img
                                  src={inst.image || '/assets/img/placeholder-avatar.png'}
                                  alt={inst.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="ci-name">{inst.name}</span>
                                {inst.designation && (
                                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {inst.designation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Schedule / Materials */}
                    {course.materials && course.materials.length > 0 && (
                      <>
                        <div className="instructors-label">Schedule &amp; Course Materials</div>
                        <div className="schedule-table-wrap">
                          <table className="schedule-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Lecture</th>
                                <th>Resources</th>
                                <th>Additional Info</th>
                              </tr>
                            </thead>
                            <tbody>
                              {course.materials.map((m, mIdx) => (
                                <tr key={mIdx}>
                                  <td>{formatTableDate(m.date)}</td>
                                  <td>{m.lecture}</td>
                                  <td>
                                    {m.resources && (m.resources.startsWith('http') || m.resources.startsWith('/') || m.resources.startsWith('slides/')) ? (
                                      <a
                                        href={m.resources}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                                      >
                                        Download / View
                                      </a>
                                    ) : (
                                      m.resources || '—'
                                    )}
                                  </td>
                                  <td>{m.additionalInfo || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
