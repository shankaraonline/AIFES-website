const outputs = [
  {
    num: '01',
    title: 'Open Datasets & Benchmarks',
    desc: 'Curated datasets for Indian and global use cases across markets, DeFi, climate, and RegTech with rigorous documentation and reproducibility standards.',
    tags: ['Markets', 'DeFi', 'Climate', 'RegTech'],
  },
  {
    num: '02',
    title: 'Research Publications',
    desc: 'Peer-reviewed papers, policy briefs, and industry reports with translational prototypes that bring research findings into applied settings.',
    tags: ['Journals', 'Policy', 'Industry'],
  },
]

export default function Outputs() {
  return (
    <section id="outputs" className="page-offset">
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
  )
}
