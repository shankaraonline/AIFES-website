import { Link } from 'react-router-dom'
import HeroCanvas from '../components/HeroCanvas'
import EventsNewsSection from '../components/EventsNewsSection'

import { researchThemes as researchAreas } from '../data/researchThemes'


export default function Home() {
  return (
    <>
      {/* Hero */}
      <section id="hero">
        {/* Three.js animated world map + stock charts */}
        <HeroCanvas />

        {/* Dark overlay for text readability */}
        <div className="hero-overlay" />

        <div className="hero-inner hero-centered">
          <p className="hero-tag">AI for Finance, Economies &amp; Society Lab</p>
          <h1 className="hero-title">
            <span className="line-gold">Trustworthy</span><br />
            <span>AI for</span><br />
            <span>Finance, Economies &amp; Society</span>
          </h1>
          <p className="hero-desc">
            AIFES advances <strong>reproducible, responsible AI</strong> across algorithmic trading,
            market microstructure, risk management, FinTech/DeFi, climate finance, RegTech, and
            computational game theory fusing market science with data-centric engineering.
          </p>
          <div className="hero-cta">
            <Link to="/research" className="btn-primary">Explore Research</Link>
            <Link to="/education" className="btn-outline">Courses</Link>
          </div>
        </div>
      </section>

      {/* Events & News */}
      <EventsNewsSection />

      {/* Research Areas */}
      <section id="research-areas">
        <div className="ra-inner">
          <p className="section-label">Research Areas</p>
          <h2 className="section-title">Four Interlocking Research Verticals</h2>
          <p className="section-sub ra-sub">
            Each theme stands alone but amplifies the others from capital markets to societal impact.
          </p>
          <div className="ra-grid">
            {researchAreas.map(({ id, theme, name, desc, img }) => (
              <Link to={`/research#${id}`} className="ra-card" key={id}>
                <div className="ra-img-wrap">
                  <img src={img} alt={name} className="ra-img" />
                  <div className="ra-img-overlay" />
                </div>
                <div className="ra-body">
                  <span className="ra-theme">{theme}</span>
                  <h3 className="ra-name">{name}</h3>
                  <p className="ra-desc">{desc}</p>
                  <span className="ra-btn">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" aria-labelledby="about-heading">
        <div className="section-inner">
          {/* ── Section header (full-width) ── */}
          <p className="section-label">About the Lab</p>
          <h2 className="section-title" id="about-heading">A New Kind of Finance Research Lab</h2>
          <p className="section-sub about-home-sub">
            Where rigorous academic research meets deployable applied technology built at IIT Hyderabad.
          </p>

          {/* ── 1 + 1 + 1 grid ── */}
          <div className="about-triptych">

            {/* Left — Lab information */}
            <div className="about-info">
              <div className="about-info-body">
                <p>
                  <strong>AIFES</strong> is a research laboratory at <strong>IIT Hyderabad</strong> dedicated
                  to advancing <strong>trustworthy AI</strong> across finance, economies, and society.
                </p>
                <p>
                  We fuse <strong>market science with data-centric engineering</strong> to deliver reproducible
                  methods, open datasets, and deployable tools not just papers.
                </p>
                <p>
                  Our research spans algorithmic trading, order-book analytics, climate risk, CBDCs,
                  RegTech compliance, and the societal impact of AI on labour markets and fairness.
                </p>
                <p>
                  <strong>Responsible AI</strong>, evaluation, assurance, and transparency is embedded
                  in every project from day one, not bolted on at the end.
                </p>
              </div>
            </div>


            {/* Center — IITH Brochure image */}
            <div className="about-img-wrap">
              <img
                src="/IITH-Internship-Brochure-2024-25-02-scaled.jpg"
                alt="IIT Hyderabad Internship Brochure — AIFES Lab"
                className="about-img"
              />
            </div>

            {/* Right — Key Objectives */}
            <div className="about-objectives">
              <p className="about-objectives-heading">Key Objectives</p>
              <div className="about-objectives-list">
                {[
                  {
                    title: 'Rigorous Research',
                    desc: 'Peer-reviewed publications, policy briefs, and industry reports grounded in sound empirical methodology.',
                  },
                  {
                    title: 'Applied Prototypes',
                    desc: 'Deployable forecasting engines, execution algorithms, and anomaly detectors built with industry partners.',
                  },
                  {
                    title: 'Talent Development',
                    desc: 'Training AI-fluent finance professionals through projects, micro-courses, and executive education.',
                  },
                  {
                    title: 'Responsible AI',
                    desc: 'Explainability, audit trails, and transparency embedded in every output from the start.',
                  },
                ].map(({ title, desc }) => (
                  <div className="objective-card" key={title}>
                    <div className="objective-body">
                      <div className="objective-title">{title}</div>
                      <div className="objective-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  )
}
