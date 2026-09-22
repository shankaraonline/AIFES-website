const phases = [
  {
    period: 'Months\n0 – 2',
    title: 'Foundation & Launch',
    items: [
      'Branding & prospectus publication',
      'Core team assembly and governance framework',
      'Announce seminar series and open student club calls',
    ],
  },
  {
    period: 'Months\n3 – 6',
    title: 'Research Ramp-Up',
    items: [
      'Inaugural Open Tech Day',
      'Recruit 1–2 MTech and 4–6 BTech research students',
      'Submit 2–3 grant applications (DST / industry)',
      'Sign 2 MOUs with industry partners',
    ],
  },
  {
    period: 'Months\n7 – 12',
    title: 'Output & Community',
    items: [
      'Release two datasets/toolkits on GitHub',
      'Publish 3–5 research briefs and papers',
      'Host Advisory Summit with international panel',
      'Expand seminar series nationally',
      'Launch inaugural startup cohort via IITH incubation cell',
    ],
  },
]

export default function Roadmap() {
  return (
    <section id="roadmap" className="page-offset">
      <div className="section-inner">
        <p className="section-label">Launch Plan</p>
        <h2 className="section-title">First 12 Months Roadmap</h2>
        <p className="section-sub">
          A clear, phased launch from branding and governance through to published research and active
          startup cohorts.
        </p>
        <div className="timeline">
          {phases.map(({ period, title, items }) => (
            <div className="tl-item" key={title}>
              <div className="tl-period">{period.split('\n').map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}</div>
              <div className="tl-content">
                <div className="tl-title">{title}</div>
                <ul className="tl-items">
                  {items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
