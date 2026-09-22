const industryPartners = ['Exchanges', 'Brokers', 'Banks', 'Fintechs', 'Ratings Agencies', 'Data Vendors']
const publicPartners = ['Central Agencies', 'State Agencies', 'Standards Bodies', 'Regulators']
const infra = ['GPU/CPU Cluster', 'Role-Based Data Lake', 'Model Registry', 'Market Data & Simulators', '20-Seat Trading Lab']

export default function Partners() {
  return (
    <section id="partners" className="page-offset">
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

        <div className="infra-grid">
          {infra.map(item => (
            <div className="infra-item" key={item}>
              <span className="infra-label">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
