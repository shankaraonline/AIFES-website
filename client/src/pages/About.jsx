import PageHero from '../components/PageHero'

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


const outputs = [
  {
    num: '01',
    title: 'Open Datasets & Benchmarks',
    desc: 'Curated datasets for Indian and global use cases across markets, DeFi, climate, and RegTech with rigorous documentation and reproducibility standards.',
    tags: ['Markets', 'DeFi', 'Climate', 'RegTech'],
    img: '/output-datasets.jpg',
  },
  {
    num: '02',
    title: 'Research Publications',
    desc: 'Peer-reviewed papers, policy briefs, and industry reports with translational prototypes that bring research findings into applied settings.',
    tags: ['Journals', 'Policy', 'Industry'],
    img: '/output-publications.jpg',
  },
]


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

      {/* ── 1st Section: Hero Banner with Untitled-design-17.jpg Background ── */}
      <PageHero
        label="About the Lab"
        title="A New Kind of Finance Research Lab"
        subtitle="Where rigorous academic research meets deployable applied technology, built at IIT Hyderabad."
        bgImage="/Untitled-design-17.jpg"
        bgPosition="center 35%"
        titleId="about-page-heading"
      />

      {/* ── Detail Overview: Lab Mission & Campus Split ── */}
      <section id="about-overview">
        <div className="section-inner" style={{ paddingTop: '64px', paddingBottom: '72px' }}>
          <div className="about-lab-split" style={{ marginTop: 0 }}>
            {/* Left — info */}
            <div className="about-info">
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
          <p className="section-label">Department of Artificial Intelligence, IIT Hyderabad</p>
          <h2 className="section-title" id="dept-heading">About the Department of AI, IIT Hyderabad</h2>

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
                {/* <h3 className="dept-block-heading">About Us</h3> */}
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

      {/* ── 4th Section: S&P Global Partnership (Left: Information, Right: Image) ── */}
      <section id="about-spglobal" aria-labelledby="spglobal-heading">
        <div className="section-inner">
          <p className="section-label">Industry Collaboration</p>
          <h2 className="section-title" id="spglobal-heading">S&amp;P Global &amp; IIT Hyderabad Partnership</h2>

          <div className="spglobal-split">
            {/* Left — Information */}
            <div className="spglobal-info">
              <div className="dept-block">
                <p className="dept-block-text">
                  <strong>S&amp;P Global</strong> is a premier worldwide provider of financial data, independent credit ratings, and iconic market benchmarks like the <strong>S&amp;P 500</strong>. The company formed a strategic tie-up with the <strong>Indian Institute of Technology, Hyderabad</strong> to bridge the gap between academic learning and financial technology industry needs.
                </p>
              </div>

              <div className="dept-block">
                <h3 className="dept-block-heading">StepForward Initiative</h3>
                <div className="dept-mission-box">
                  <p className="dept-mission-text">
                    This partnership is powered by <strong>S&amp;P Global’s StepForward Initiative</strong>, a major global corporate social responsibility framework focused on workforce readiness.
                  </p>
                </div>
              </div>

              <div className="dept-block">
                <p className="dept-block-text">
                  The collaboration specifically delivers specialised training to students in <strong>Artificial Intelligence, Machine Learning, and advanced digital skills</strong>. The initiative leverages S&amp;P Global’s massive technology hub in Hyderabad to help transform the region into a core center for global data operations.
                </p>
              </div>
            </div>

            {/* Right — Image */}
            <div className="spglobal-img-wrap">
              <img
                src="/SP_Global_Logo.jpg"
                alt="S&P Global Logo"
                className="spglobal-img"
              />
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
            Balanced representation from academia, industry, and regulators with clear terms and engagement cadence.
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


      {/* ── 5th Section: Flagship Outputs (2 Columns with Images) ── */}
      <section id="about-outputs">
        <div className="section-inner">
          <p className="section-label">Flagship Outputs</p>
          <h2 className="section-title">What AIFES Delivers</h2>
          <p className="section-sub">
            Every output is designed for real-world use open, reproducible, and deployable.
          </p>

          <div className="about-outputs-grid">
            {outputs.map(({ num, title, desc, tags, img }) => (
              <div className="about-output-card" key={num}>
                <div className="about-output-img-wrap">
                  <img src={img} alt={title} className="about-output-img" />
                  <span className="about-output-num">{num}</span>
                </div>
                <div className="about-output-body">
                  <h3 className="about-output-title">{title}</h3>
                  <p className="about-output-desc">{desc}</p>
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


    </div>
  )
}
