import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * OpeningCeremony — Virtual Ribbon Cutting for Official Website Launch.
 * 
 * COMPLETELY SELF-CONTAINED:
 * - All styles are scoped in the <style> block inside this file.
 * - Pure HTML5 Canvas confetti (zero dependencies).
 * - Clicking the ribbon cuts it and directly takes the user to the website ('/').
 * - Clean: no scissors, no badges, no bottom comments.
 */
export default function OpeningCeremony() {
  const navigate = useNavigate()
  const [isCut, setIsCut] = useState(false)
  const canvasRef = useRef(null)

  // ── Confetti Particle Engine ──
  useEffect(() => {
    if (!isCut) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Vibrant celebration palette: Gold, Crimson, Champagne, Silver
    const colors = ['#f59e0b', '#d97706', '#ef4444', '#dc2626', '#ffffff', '#fbbf24', '#fef08a']
    const particles = []

    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 16 + 6
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        gravity: 0.32,
        drag: 0.98,
        opacity: 1,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.vx *= p.drag
        p.vy = p.vy * p.drag + p.gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity = Math.max(0, p.opacity - 0.012)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6)
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [isCut])

  // ── Cut Ribbon Trigger & Direct Navigation ──
  const handleCutRibbon = () => {
    if (isCut) return
    setIsCut(true)

    // Smooth ribbon parting + celebratory burst, then direct transition to website
    setTimeout(() => {
      navigate('/')
    }, 450)
  }

  return (
    <div className="ceremony-container">
      <style>{`
        .ceremony-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
          z-index: 999999;
          user-select: none;
        }

        /* Ambient spotlight */
        .ceremony-spotlight {
          display: none;
        }

        /* Header */
        .ceremony-header {
          position: absolute;
          top: 10%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.15rem;
          z-index: 10;
          text-align: center;
          animation: ceremonyFadeDown 0.8s ease-out;
        }

        .ceremony-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 0.75rem 2rem;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.45);
        }

        .ceremony-main-logo {
          height: 60px;
          width: auto;
          max-width: 420px;
          object-fit: contain;
          display: block;
        }

        .ceremony-title {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 75%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── Full Ribbon Interactive Track ── */
        .ceremony-ribbon-stage {
          position: absolute;
          top: 48%;
          left: 0;
          transform: translateY(-50%);
          width: 100vw;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          cursor: pointer;
        }

        /* Satin Ribbon band stretching across */
        .ribbon-half {
          position: absolute;
          top: 50%;
          height: 52px;
          background: linear-gradient(180deg, #dc2626 0%, #b91c1c 45%, #991b1b 75%, #ef4444 100%);
          border-top: 3px solid #fbbf24;
          border-bottom: 3px solid #fbbf24;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.5), 0 0 20px rgba(245, 158, 11, 0.4);
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease;
        }

        .ribbon-left {
          left: 0;
          right: 50%;
          transform-origin: left center;
        }

        .ribbon-right {
          left: 50%;
          right: 0;
          transform-origin: right center;
        }

        .ribbon-left.cut {
          transform: translateY(-50%) rotate(-18deg) translateX(-120%);
          opacity: 0;
        }

        .ribbon-right.cut {
          transform: translateY(-50%) rotate(18deg) translateX(120%);
          opacity: 0;
        }

        /* Center Silk Bow */
        .ceremony-bow-wrap {
          position: relative;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .ceremony-ribbon-stage:hover .ceremony-bow-wrap {
          transform: scale(1.08);
          filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.8));
        }

        .ceremony-bow-wrap.cut {
          animation: bowPart 0.5s ease-out forwards;
        }

        @keyframes bowPart {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }

        .ceremony-bow-svg {
          width: 170px;
          height: 150px;
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 18px rgba(245, 158, 11, 0.4));
          animation: bowFloat 3s infinite ease-in-out;
        }

        @keyframes bowFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* Confetti Canvas */
        .ceremony-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 25;
        }

        @keyframes ceremonyFadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .ceremony-header {
            top: 7%;
            gap: 0.85rem;
          }
          .ceremony-ribbon-stage {
            top: 50%;
          }
          .ceremony-logos {
            padding: 0.5rem 1.2rem;
          }
          .ceremony-main-logo {
            height: 42px;
            max-width: 260px;
          }
          .ribbon-half {
            height: 42px;
          }
          .ceremony-bow-svg {
            width: 130px;
            height: 120px;
          }
        }
      `}</style>

      {/* Ambient Spotlight */}
      <div className="ceremony-spotlight" />

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="ceremony-canvas" />

      {/* Header with Logos */}
      <header className="ceremony-header">
        <div className="ceremony-logos">
          <img
            src="/spg_IITHyderabad_horizontal_pos_rgb.png"
            alt="S&P Global | IIT Hyderabad"
            className="ceremony-main-logo"
          />
        </div>

        <h1 className="ceremony-title">AI Innovation Lab</h1>
      </header>

      {/* Interactive Ribbon & Ceremonial Bow */}
      <div
        className="ceremony-ribbon-stage"
        onClick={handleCutRibbon}
        title="Click to inaugurate"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCutRibbon()
        }}
      >
        <div className={`ribbon-half ribbon-left ${isCut ? 'cut' : ''}`} />

        <div className={`ceremony-bow-wrap ${isCut ? 'cut' : ''}`}>
          <svg viewBox="0 0 200 160" className="ceremony-bow-svg">
            <defs>
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="ribbonDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
              <linearGradient id="goldKnot" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="80%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Left Ribbon Tail */}
            <path
              d="M 94 75 C 80 105, 55 130, 40 152 L 62 140 L 80 152 C 86 128, 92 102, 98 78 Z"
              fill="url(#ribbonDark)"
              stroke="#fbbf24"
              strokeWidth="2"
            />

            {/* Right Ribbon Tail */}
            <path
              d="M 106 75 C 120 105, 145 130, 160 152 L 138 140 L 120 152 C 114 128, 108 102, 102 78 Z"
              fill="url(#ribbonDark)"
              stroke="#fbbf24"
              strokeWidth="2"
            />

            {/* Left Bow Loop */}
            <path
              d="M 98 70 C 65 24, 15 42, 22 75 C 28 102, 70 85, 98 76 Z"
              fill="url(#ribbonGrad)"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />

            {/* Right Bow Loop */}
            <path
              d="M 102 70 C 135 24, 185 42, 178 75 C 172 102, 130 85, 102 76 Z"
              fill="url(#ribbonGrad)"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />

            {/* Golden Medallion Knot in Center */}
            <ellipse
              cx="100"
              cy="73"
              rx="24"
              ry="20"
              fill="url(#goldKnot)"
              stroke="#fef3c7"
              strokeWidth="3"
            />
            <circle
              cx="100"
              cy="73"
              r="12"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          </svg>
        </div>

        <div className={`ribbon-half ribbon-right ${isCut ? 'cut' : ''}`} />
      </div>
    </div>
  )
}
