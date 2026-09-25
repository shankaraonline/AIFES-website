import { useState } from 'react'
import PageHero from '../components/PageHero'

const BASE = 'https://ai-iith-web.github.io/AIFES'

const schedule = [
  { date: '31 Jul 2026', lecture: 'Lecture 0: Introduction to AI in Finance', slides: 'Will update soon', other: '—' },
  { date: '6 Aug 2026', lecture: 'Lecture 1: Basic Financial Instruments', slides: 'Will update soon', other: '—' },
  { date: '8 Aug 2026', lecture: 'Lecture 2: Binomial Models For Option Pricing', slides: 'Will update soon', other: '—' },
  { date: '11 Aug 2026', lecture: 'Lecture 3: Binomial Models For Option Pricing (contd.)', slides: 'Will update soon', other: '—' },
]

const instructors = [
  { name: 'Prof. Easwar Subramanian', href: 'https://www.linkedin.com/in/easwar-subramanian/', img: `${BASE}/assets/img/Easwar-Subramanian.jpg`, alt: 'Prof Easwar Subramanian' },
  { name: 'Prof. Ganesh Ghalme', href: 'https://sites.google.com/view/ganeshghalme/home?authuser=', img: `${BASE}/assets/img/Ganesh-IITH.jpg`, alt: 'Prof Ganesh Ghalme' },
  { name: 'Prof. V L Raju Chinthalapati', href: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/', img: `${BASE}/assets/img/V-L-Raju.png`, alt: 'Prof V L Raju Chinthalapati' },
]

export default function Education() {
  const [open, setOpen] = useState(false)

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
          {/* Accordion */}
          <div className={`advisory-note${open ? ' open' : ''}`}>
            <div
              className="advisory-summary"
              onClick={() => setOpen(o => !o)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
            >
              <div>
                <div className="advisory-title">Credit Course · IIT Hyderabad</div>
                <div className="advisory-names">
                  <strong>AI in Finance</strong> — 3-credit, semester-long course.
                </div>
                <div className="course-meta">
                  <span className="tag">AI4403</span>
                  <span className="tag">Aug – Nov 2026</span>
                </div>
              </div>
              <span className={`advisory-chevron${open ? ' open' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {open && (
              <div className="advisory-desc">
                <div className="instructors-label">Course Overview</div>
                <p>
                  This course provides a comprehensive introduction to Artificial Intelligence in Finance by
                  integrating foundational financial concepts, mathematical modelling, and modern
                  machine-learning techniques. This course aims to cover classical financial theory and
                  contemporary AI techniques combined to address asset pricing, trading, portfolio management,
                  risk assessment, and financial decision-making problems. The contents taught in the course
                  include (not limited to) time value of money, financial instruments, derivatives, pricing,
                  stochastic processes, and the Black–Scholes framework before progressing to Monte Carlo
                  methods, volatility modelling, portfolio optimization (Classical Markowitz theory and modern
                  approaches), risk measures, forecasting, backtesting and algorithmic trading.
                </p>
                <p>
                  The course also examines credit risk and systemic financial risk using methods such as
                  XGBoost and graph neural networks. Advanced modules cover synthetic financial data
                  generation, stress testing, and emerging agentic finance systems.
                </p>

                <div className="instructors-label">Prerequisites</div>
                <p>
                  Students are expected to have completed the Foundations of Machine Learning (FoML) or
                  Pattern Recognition and Machine Learning (PRML) course. While knowledge of Deep Learning
                  and Reinforcement Learning is desired, it is not a mandatory prerequisite.
                </p>

                <div className="instructors-label">Instructors</div>
                <div className="course-instructors">
                  {instructors.map(({ name, href, img, alt }) => (
                    <a className="course-instructor" href={href} target="_blank" rel="noopener noreferrer" key={name}>
                      <span className="ci-avatar"><img src={img} alt={alt} /></span>
                      <span className="ci-name">{name}</span>
                    </a>
                  ))}
                </div>

                <div className="instructors-label">Schedule</div>
                <div className="schedule-table-wrap">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Lecture</th>
                        <th>Slides</th>
                        <th>Other</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map(({ date, lecture, slides, other }) => (
                        <tr key={date}>
                          <td>{date}</td>
                          <td>{lecture}</td>
                          <td>{slides}</td>
                          <td>{other}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
