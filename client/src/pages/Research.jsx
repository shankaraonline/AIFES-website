import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'

import { researchThemes as themes } from '../data/researchThemes'

export default function Research() {
  const location = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (location.hash) {
      const targetId = location.hash.replace('#', '')
      const el = document.getElementById(targetId)
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 120)
        return () => clearTimeout(timer)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.hash])
  return (
    <div className="page-offset research-page">
      {/* ── 1st Section: Hero Banner with IIT Hyderabad Background ── */}
      <PageHero
        label="Research Themes"
        title="Four Interlocking Research Pillars"
        subtitle="Each theme stands alone but amplifies the others. Finance informs Economy models, and Economy models shape Society impact analysis."
        bgImage="/LYD03460-2048x1365.jpg"
        bgPosition="center 42%"
        titleId="research-heading"
      />

      {/* ── Research Themes Pillars ── */}
      <section id="themes" className="research-themes-section">
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
    </div>
  )
}
