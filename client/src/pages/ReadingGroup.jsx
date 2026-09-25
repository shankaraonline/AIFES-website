import PageHero from '../components/PageHero'

const BASE = 'https://ai-iith-web.github.io/AIFES'

const faculty = [
  { name: 'Prof. Ganesh Ghalme', role: 'Faculty — IIT Hyderabad', href: 'https://sites.google.com/view/ganeshghalme/home?authuser=', img: `${BASE}/assets/img/Ganesh-IITH.jpg`, alt: 'Prof Ganesh Ghalme' },
  { name: 'Prof. V L Raju Chinthalapati', role: 'Faculty — IIT Hyderabad', href: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/', img: `${BASE}/assets/img/V-L-Raju.png`, alt: 'Prof V L Raju Chinthalapati' },
  { name: 'Prof. Phanindra Jampana', role: 'Faculty — IIT Hyderabad', href: 'https://people.iith.ac.in/pjampana/', img: `${BASE}/assets/img/phanindra.jpg`, alt: 'Prof Phanindra Jampana' },
  { name: 'Prof. Karthik PN', role: 'Faculty — IIT Hyderabad', href: 'https://karthikpn.com/', img: `${BASE}/assets/img/karthikpn.jpg`, alt: 'Prof Karthik PN' },
]

const students = [
  { name: 'Vishnuhemanth Tiruvalluru', info: 'M. Tech (RA) · 2024 – Now' },
  { name: 'Aditya Varun V', info: 'B. Tech · 2022 – Now' },
  { name: 'Kush Mathukiya', info: 'PhD Student · 2025 – Now' },
  { name: 'Viswa Kiran VVS', info: 'M. Tech · 2024 – 2026' },
  { name: 'Akshintala Venkata Mahvith Kusumakar', info: 'M. Tech (RA) · 2023 – 2026' },
]

const materials = [
  { session: '1. Probability Basics', href: 'slides/Reading%20Group/1-probability-basics.pdf' },
  { session: '2. Conditional Expectation', href: 'slides/Reading%20Group/2-conditional-expectation.pdf' },
  { session: '3. Kolmogorov 0-1 Law', href: 'slides/Reading%20Group/3-kolmogorov-0-1-law.pdf' },
  { session: '4. Martingales', href: 'slides/Reading%20Group/4-martingales.pdf' },
  { session: '5. Brownian Motion', href: 'slides/Reading%20Group/5-brownian-motion.pdf' },
  { session: '6. Brownian Motion - Part 2', href: 'slides/Reading%20Group/6-brownian-motion-part-2.pdf' },
  { session: '7. Ito Calculus and Geometric Brownian Motion', href: 'slides/Reading%20Group/7-ito-calculus-and-geometric-brownian-motion.pdf' },
  { session: '8. Girsanov\'s Theorem and Risk Neutral Measure', href: 'slides/Reading%20Group/8-girsanovs-theorem-and-risk-neutral-measure.pdf' },
]

export default function ReadingGroup() {
  return (
    <div className="page-offset reading-group-page">
      <PageHero
        label="Research Community"
        title="AIFES Research Reading Group"
        subtitle="A collaborative forum where faculty and students explore the mathematical foundations and research directions in AI for Finance, Economies, and Society."
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
            <div className="people-grid" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {faculty.map(({ name, role, href, img, alt }) => (
                <div className="person-card" key={name}>
                  <div className="person-avatar">
                    <img src={img} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="person-name">
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {name}
                    </a>
                  </div>
                  <div className="person-role">{role}</div>
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
                  </tr>
                </thead>
                <tbody>
                  {students.map(({ name, info }) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{info}</td>
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
                    <th>Session</th>
                    <th>Material</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(({ session, href }) => (
                    <tr key={session}>
                      <td>{session}</td>
                      <td>
                        <a href={href} target="_blank" rel="noopener noreferrer">Slides</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
