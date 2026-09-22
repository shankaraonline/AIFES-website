
/* ── Data ───────────────────────────────────────────────────────── */
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

const communityCards = [
  {
    title: 'AIFES Dialogues',
    desc: 'Monthly talks spanning Finance, Economies, and Society. All sessions recorded with slides and code artefacts published openly.',
  },
  {
    title: 'Research Presentations',
    desc: 'Monthly research presentations, weekly reading groups, and cross-theme hack nights every semester.',
  },
  {
    title: 'Quant & Algo Club',
    desc: 'Student club focused on quantitative finance, algorithmic trading, and strategy development with real market data.',
  },
]

const outputs = [
  {
    num: '01',
    title: 'Open Datasets & Benchmarks',
    desc: 'Curated datasets for Indian and global use cases across markets, DeFi, climate, and RegTech — with rigorous documentation and reproducibility standards.',
    tags: ['Markets', 'DeFi', 'Climate', 'RegTech'],
  },
  {
    num: '02',
    title: 'Research Publications',
    desc: 'Peer-reviewed papers, policy briefs, and industry reports — with translational prototypes that bring research findings into applied settings.',
    tags: ['Journals', 'Policy', 'Industry'],
  },
]

const industryPartners = ['Exchanges', 'Brokers', 'Banks', 'Fintechs', 'Ratings Agencies', 'Data Vendors']
const publicPartners   = ['Central Agencies', 'State Agencies', 'Standards Bodies', 'Regulators']
const infra            = ['GPU/CPU Cluster', 'Role-Based Data Lake', 'Model Registry', 'Market Data & Simulators', '20-Seat Trading Lab']

const objectives = [
  {
    title: 'Rigorous Research',
    desc: 'Peer-reviewed publications, policy briefs, and industry reports grounded in sound empirical methodology.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: 'Applied Prototypes',
    desc: 'Deployable forecasting engines, execution algorithms, and anomaly detectors built with industry partners.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Talent Development',
    desc: 'Training AI-fluent finance professionals through projects, micro-courses, and executive education.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: 'Responsible AI',
    desc: 'Explainability, audit trails, and transparency embedded in every output from the start.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

/* ── Component ──────────────────────────────────────────────────── */
export default function About() {
  return (
    <div className="page-offset">

      {/* ── 1st Section: About the Lab (Left: Info, Right: Image) ── */}
      <section id="about-hero" aria-labelledby="about-page-heading">
        <div className="section-inner">
          <p className="section-label">About the Lab</p>
          <h1 className="section-title" id="about-page-heading">A New Kind of Finance Research Lab</h1>

          <div className="about-lab-split">
            {/* Left — info */}
            <div className="about-info">
              <p className="about-info-sub">
                Where rigorous academic research meets deployable applied technology, built at IIT Hyderabad.
              </p>
              <div className="about-info-body">
                <p>
                  <strong>AIFES</strong> is a research laboratory at <strong>IIT Hyderabad</strong> dedicated
                  to advancing <strong>trustworthy AI</strong> across finance, economies, and society.
                </p>
                <p>
                  We fuse <strong>market science with data-centric engineering</strong> to deliver reproducible
                  methods, open datasets, and deployable tools, not just papers.
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

            {/* Right — IITH image */}
            <div className="about-lab-img-wrap">
              <img
                src="/IITH-Internship-Brochure-2024-25-02-scaled.jpg"
                alt="IIT Hyderabad — AIFES Lab"
                className="about-lab-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2nd Section: Key Objectives (1 Row, 4 Cards with Icons, Headings, Descriptions) ── */}
      <section id="about-objectives-section">
        <div className="section-inner">
          <p className="section-label">Key Objectives</p>
          <h2 className="section-title">Our Strategic Focus Areas</h2>
          <p className="section-sub">
            Grounded in four pillars bridging fundamental theory, deployable algorithms, talent skilling, and responsible governance.
          </p>

          <div className="about-objectives-row">
            {objectives.map(({ title, desc, icon }) => (
              <div className="about-obj-card" key={title}>
                <div className="about-obj-icon">
                  {icon}
                </div>
                <h3 className="about-obj-title">{title}</h3>
                <p className="about-obj-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3rd Section: About the Department of AI (Left: Image, Right: Information) ── */}
      <section id="about-dept" aria-labelledby="dept-heading">
        <div className="section-inner">
          <p className="section-label">Department of Artificial Intelligence</p>
          <h2 className="section-title" id="dept-heading">About the Department of AI</h2>

          <div className="dept-split">
            {/* Left — Image */}
            <div className="dept-img-wrap">
              <img
                src="/LYD03460-2048x1365.jpg"
                alt="Department of Artificial Intelligence — IIT Hyderabad"
                className="dept-img"
              />
            </div>

            {/* Right — Information */}
            <div className="dept-info">
              <div className="dept-block">
                <h3 className="dept-block-heading">About Us</h3>
                <p className="dept-block-text">
                  The Department of Artificial Intelligence (AI) at IIT Hyderabad, founded in 2019, is dedicated to providing cutting-edge academic programs that equip students with a deep understanding of AI theory and practical applications. With a strong focus on fostering innovation and research, the department aims to build a comprehensive ecosystem that nurtures future leaders and pioneers in the field of Artificial Intelligence.
                </p>
              </div>

              <div className="dept-block">
                <h3 className="dept-block-heading">Our Mission</h3>
                <div className="dept-mission-box">
                  <p className="dept-mission-text">
                    The department’s mission is to “Enable and facilitate students to become leaders in the AI industry and academia nationally and internationally, as well as to meet the pressing demands of the country in the various subareas and applications of AI”.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── People & Leadership ── */}
      <section id="about-people">
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

      {/* ── Community ── */}
      <section id="about-community" style={{ background: 'var(--bg-1)' }}>
        <div className="section-inner">
          <p className="section-label">Community &amp; Outreach</p>
          <h2 className="section-title">AIFES Dialogues &amp; Open Tech Days</h2>
          <p className="section-sub">
            Monthly events, weekly reading groups, and semester hack nights — open to students,
            researchers, and practitioners.
          </p>
          <div className="community-grid">
            {communityCards.map(({ title, desc }) => (
              <div className="comm-card" key={title}>
                <div className="comm-title">{title}</div>
                <div className="comm-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outputs ── */}
      <section id="about-outputs">
        <div className="section-inner">
          <p className="section-label">Flagship Outputs</p>
          <h2 className="section-title">What AIFES Delivers</h2>
          <p className="section-sub">
            Every output is designed for real-world use — open, reproducible, and deployable.
          </p>
          <div className="outputs-grid">
            {outputs.map(({ num, title, desc, tags }) => (
              <div className="output-card" key={num}>
                <div className="output-num">{num}</div>
                <div className="output-body">
                  <div className="output-title">{title}</div>
                  <div className="output-desc">{desc}</div>
                  <div className="output-tags">
                    {tags.map(tag => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners & Infrastructure ── */}
      <section id="about-partners" style={{ background: 'var(--bg-1)' }}>
        <div className="section-inner">
          <p className="section-label">Partners &amp; Infrastructure</p>
          <h2 className="section-title">Built for Scale &amp; Real-World Impact</h2>
          <p className="section-sub">
            Deep industry connections and research-grade infrastructure from day one.
          </p>
          <div className="partner-categories">
            <div className="partner-cat">
              <div className="partner-cat-title">Industry Partners</div>
              <div className="partner-items">
                {industryPartners.map(p => <span className="partner-chip" key={p}>{p}</span>)}
              </div>
            </div>
            <div className="partner-cat">
              <div className="partner-cat-title">Public &amp; Regulatory Partners</div>
              <div className="partner-items">
                {publicPartners.map(p => <span className="partner-chip" key={p}>{p}</span>)}
              </div>
            </div>
          </div>
          <div className="infra-grid" style={{ marginTop: '2rem' }}>
            {infra.map(item => (
              <div className="infra-item" key={item}>
                <span className="infra-label">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
