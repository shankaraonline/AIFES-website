const cards = [
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

export default function Community() {
  return (
    <section id="community" className="page-offset">
      <div className="section-inner">
        <p className="section-label">Community &amp; Outreach</p>
        <h2 className="section-title">AIFES Dialogues &amp; Open Tech Days</h2>
        <p className="section-sub">
          Monthly events, weekly reading groups, and semester hack nights — open to students,
          researchers, and practitioners.
        </p>
        <div className="community-grid">
          {cards.map(({ title, desc }) => (
            <div className="comm-card" key={title}>
              <div className="comm-title">{title}</div>
              <div className="comm-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
