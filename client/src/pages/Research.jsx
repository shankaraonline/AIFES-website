import { useEffect } from 'react'

const themes = [
  {
    id: 'finance',
    letter: 'Theme A',
    name: 'Finance',
    img: '/research_finance.jpg',
    imgAlt: 'Financial charts and algorithmic trading',
    items: [
      { title: 'Financial Analytics', desc: 'Time-series & factor research, portfolio analytics, nowcasting, alternative-data fusion.' },
      { title: 'Algorithmic Trading', desc: 'Strategy discovery, adaptive execution, order-book analytics, market impact.' },
      { title: 'Risk Management', desc: 'Market, credit, liquidity & operational risk; ML-assisted early warning; explainable scores.' },
      { title: 'AI in Finance', desc: 'Document intelligence, graph-based entity linking, retrieval pipelines.' },
    ],
  },
  {
    id: 'economies',
    letter: 'Theme B',
    name: 'Economies',
    img: '/research_economies.jpg',
    imgAlt: 'Blockchain and DeFi global network',
    items: [
      { title: 'FinTech & DeFi', desc: 'CBDC/DeFi analytics, payments & lending, financial inclusion, KYC/AML.' },
      { title: 'Token Economy & Market Design', desc: 'Mechanism & incentive alignment, governance, reputation systems.' },
      { title: 'Climate Finance & Energy', desc: 'Transition/physical risk, carbon markets, green bonds, ESG assurance, power-market analytics.' },
    ],
  },
  {
    id: 'society',
    letter: 'Theme C',
    name: 'Society',
    img: '/research_society.jpg',
    imgAlt: 'Society, AI fairness and regulatory compliance',
    items: [
      { title: 'RegTech & SupTech', desc: 'Model-risk management, compliance automation, audit trails, standards mapping.' },
      { title: 'Computational Game Theory', desc: 'Strategic behaviour, auctions, credit-rating games, platform policies.' },
      { title: "AI's Impact on Economy & Society", desc: 'Productivity & jobs, fairness & safety, alignment, policy simulation.' },
    ],
  },
  {
    id: 'math-finance',
    letter: 'Theme D',
    name: 'Mathematical Finance',
    img: '/research_math_finance.jpg',
    imgAlt: 'Stochastic calculus and derivative pricing equations',
    items: [
      { title: 'Stochastic Calculus', desc: 'Brownian motion, Itô processes, stochastic differential equations.' },
      { title: 'Derivative Pricing', desc: 'Option pricing theory, Black–Scholes models, arbitrage-free pricing.' },
      { title: 'Financial Mathematics', desc: 'Martingale methods, risk-neutral measures, portfolio optimization.' },
      { title: 'Quantitative Methods', desc: 'Mathematical modeling of financial markets and economic systems.' },
    ],
  },
]

export default function Research() {
  useEffect(() => {
    // Stop the browser from restoring its own scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // Always start from the very top
    window.scrollTo({ top: 0, behavior: 'instant' })

    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 200)
      }
    }
  }, [])
  return (
    <section id="themes" className="page-offset">
      <div className="section-inner">
        <p className="section-label">Research Themes</p>
        <h2 className="section-title">Four Interlocking Research Pillars</h2>
        <p className="section-sub research-sub">
          Each theme stands alone but amplifies the others Finance informs Economy models; Economy models shape Society impact analysis.
        </p>
      </div>

      <div className="research-rows">
        {themes.map(({ id, letter, name, img, imgAlt, items }, idx) => {
          const isEven = idx % 2 === 1
          const infoBlock = (
            <div className="rr-info">
              <span className="rr-letter">{letter}</span>
              <h3 className="rr-name">{name}</h3>
              <ul className="rr-items">
                {items.map(({ title, desc }) => (
                  <li key={title} className="rr-item">
                    <div className="rr-item-title">{title}</div>
                    <div className="rr-item-desc">{desc}</div>
                  </li>
                ))}
              </ul>
            </div>
          )
          const imageBlock = (
            <div className="rr-img-wrap">
              <img src={img} alt={imgAlt} className="rr-img" />
              <div className="rr-img-overlay" />
            </div>
          )

          return (
            <div id={id} className={`rr-row${isEven ? ' rr-row-reverse' : ''}`} key={letter}>
              <div className="rr-inner">
                {isEven ? <>{imageBlock}{infoBlock}</> : <>{infoBlock}{imageBlock}</>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
