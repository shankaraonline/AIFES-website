const BASE = 'https://ai-iith-web.github.io/AIFES'

const people = [
  {
    name: 'Prof Ganesh Ghalme',
    role: 'Co-Director',
    href: 'https://sites.google.com/view/ganeshghalme/home?authuser=',
    img: `${BASE}/assets/img/Ganesh-IITH.jpg`,
    alt: 'Prof Ganesh Ghalme',
    desc: 'Joint academic lead. Responsible for lab strategy, research direction, and external partnerships.',
  },
  {
    name: 'Prof V L Raju Chinthalapati',
    role: 'Co-Director',
    href: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/',
    img: `${BASE}/assets/img/V-L-Raju.png`,
    alt: 'Prof V L Raju Chinthalapati',
    desc: 'Joint academic lead. Responsible for curriculum, faculty development, and institutional governance.',
  },
]

export default function People() {
  return (
    <section id="people" className="page-offset">
      <div className="section-inner">
        <p className="section-label">People &amp; Governance</p>
        <h2 className="section-title">Leadership &amp; Advisory Panel</h2>
        <p className="section-sub">
          Balanced representation from academia, industry, and regulators — with clear terms and
          engagement cadence.
        </p>

        <div className="people-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 460px))', justifyContent: 'center' }}>
          {people.map(({ name, role, href, img, alt, desc }) => (
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
              <div className="person-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
