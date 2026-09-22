import { useEffect, useRef } from 'react'

/* ──────────────────────────────────────────────
   World-map dot coordinates (equirectangular)
   lat/lon pairs sampled over land masses
──────────────────────────────────────────────── */
const LAND_REGIONS = [
  // North America
  { latMin: 25, latMax: 72, lonMin: -168, lonMax: -52 },
  // South America
  { latMin: -56, latMax: 12, lonMin: -82, lonMax: -34 },
  // Europe
  { latMin: 36, latMax: 71, lonMin: -10, lonMax: 40 },
  // Africa
  { latMin: -35, latMax: 37, lonMin: -18, lonMax: 52 },
  // Asia main
  { latMin: 10, latMax: 77, lonMin: 40, lonMax: 145 },
  // SE Asia
  { latMin: -10, latMax: 28, lonMin: 95, lonMax: 145 },
  // Australia
  { latMin: -40, latMax: -10, lonMin: 114, lonMax: 154 },
  // Greenland
  { latMin: 60, latMax: 84, lonMin: -56, lonMax: -18 },
  // Indian subcontinent
  { latMin: 8,  latMax: 35, lonMin: 68, lonMax: 90 },
  // Japan
  { latMin: 30, latMax: 45, lonMin: 129, lonMax: 146 },
]

function isLand(lat, lon) {
  for (const r of LAND_REGIONS) {
    if (lat >= r.latMin && lat <= r.latMax && lon >= r.lonMin && lon <= r.lonMax) {
      return true
    }
  }
  return false
}

/* Pre-generate dots once */
const MAP_DOTS = (() => {
  const dots = []
  const step = 2.2 // degree spacing — smaller = denser map
  for (let lat = -80; lat <= 80; lat += step) {
    for (let lon = -180; lon <= 180; lon += step) {
      if (isLand(lat, lon)) {
        // equirectangular projection: lon→x, lat→y
        dots.push({
          nx: (lon + 180) / 360,          // 0-1
          ny: (90 - lat) / 180,           // 0-1
        })
      }
    }
  }
  return dots
})()

/* ── chart helpers ── */
function initChartData(count, base, amp) {
  const arr = []
  let y = base
  for (let i = 0; i < count; i++) {
    y += (Math.random() - 0.48) * amp
    y = Math.max(base - amp * 4, Math.min(base + amp * 4, y))
    arr.push(y)
  }
  return arr
}

function pushNew(arr, base, amp) {
  const last = arr[arr.length - 1]
  let next = last + (Math.random() - 0.48) * amp
  next = Math.max(base - amp * 4, Math.min(base + amp * 4, next))
  arr.shift()
  arr.push(next)
}

/* ── grid lines (lat/lon lines drawn flat) ── */
function drawGrid(ctx, W, H) {
  ctx.save()
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)'
  ctx.lineWidth = 0.5
  // longitude lines
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * W
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  // latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * H
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()
}

export default function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W, H, frameId
    const LINE_COUNT = 120
    const BAR_COUNT  = 40

    /* chart state */
    let lineData1, lineData2, barData

    function init() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      const mid = H * 0.62
      lineData1 = initChartData(LINE_COUNT, mid, H * 0.028)
      lineData2 = initChartData(LINE_COUNT, mid + H * 0.05, H * 0.02)
      barData    = initChartData(BAR_COUNT,  0,   H * 0.22)
    }

    let t = 0
    function draw() {
      frameId = requestAnimationFrame(draw)
      t++

      ctx.clearRect(0, 0, W, H)

      /* ── background gradient ── */
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0,   '#ffffff')
      bg.addColorStop(0.5, '#f8fafc')
      bg.addColorStop(1,   '#f1f5f9')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      /* ── grid lines ── */
      drawGrid(ctx, W, H)

      /* ── world map dots ── */
      const dotR = Math.max(1.5, W * 0.0015)
      ctx.fillStyle = 'rgba(100, 116, 139, 0.22)'
      for (const { nx, ny } of MAP_DOTS) {
        const x = nx * W
        const y = ny * H
        ctx.beginPath()
        ctx.arc(x, y, dotR, 0, Math.PI * 2)
        ctx.fill()
      }

      /* ── centre glow ── */
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.45)
      glow.addColorStop(0,   'rgba(180, 83, 9, 0.05)')
      glow.addColorStop(1,   'rgba(255, 255, 255, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      /* ────────── LEFT stock line chart ────────── */
      /* update data every 3 frames for smooth scroll */
      if (t % 3 === 0) {
        pushNew(lineData1, H * 0.62, H * 0.028)
        pushNew(lineData2, H * 0.67, H * 0.02)
      }

      const LEFT_W = W * 0.38
      const xStep  = LEFT_W / (LINE_COUNT - 1)

      // filled area under line 1
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (let i = 0; i < LINE_COUNT; i++) {
        ctx.lineTo(i * xStep, lineData1[i])
      }
      ctx.lineTo(LEFT_W, H)
      ctx.closePath()
      const fillGrad = ctx.createLinearGradient(0, H * 0.4, 0, H)
      fillGrad.addColorStop(0, 'rgba(37, 99, 235, 0.09)')
      fillGrad.addColorStop(1, 'rgba(37, 99, 235, 0.01)')
      ctx.fillStyle = fillGrad
      ctx.fill()

      // line 1 (brighter)
      ctx.beginPath()
      for (let i = 0; i < LINE_COUNT; i++) {
        i === 0 ? ctx.moveTo(i * xStep, lineData1[i]) : ctx.lineTo(i * xStep, lineData1[i])
      }
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.85)'
      ctx.lineWidth   = 1.5
      ctx.shadowColor = 'rgba(37, 99, 235, 0.25)'
      ctx.shadowBlur  = 4
      ctx.stroke()
      ctx.shadowBlur = 0

      // line 2 (dimmer, slightly lower)
      ctx.beginPath()
      for (let i = 0; i < LINE_COUNT; i++) {
        i === 0 ? ctx.moveTo(i * xStep, lineData2[i]) : ctx.lineTo(i * xStep, lineData2[i])
      }
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)'
      ctx.lineWidth   = 1
      ctx.stroke()

      /* dot on latest value */
      const lastX1 = (LINE_COUNT - 1) * xStep
      const lastY1 = lineData1[LINE_COUNT - 1]
      ctx.beginPath()
      ctx.arc(lastX1, lastY1, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(37, 99, 235, 1)'
      ctx.fill()

      /* ────────── RIGHT candlestick / bar chart ────────── */
      if (t % 3 === 0) {
        pushNew(barData, 0, H * 0.22)
      }

      const BAR_AREA_W  = W * 0.36
      const BAR_X_START = W - BAR_AREA_W
      const barW        = (BAR_AREA_W / BAR_COUNT) * 0.55
      const barSpacing  = BAR_AREA_W / BAR_COUNT

      for (let i = 0; i < BAR_COUNT; i++) {
        const bx   = BAR_X_START + i * barSpacing
        const barH = Math.abs(barData[i])
        const by   = H - barH

        // gradient bar
        const barGrad = ctx.createLinearGradient(0, by, 0, H)
        barGrad.addColorStop(0, 'rgba(180, 83, 9, 0.3)')
        barGrad.addColorStop(1, 'rgba(180, 83, 9, 0.04)')
        ctx.fillStyle = barGrad
        ctx.fillRect(bx, by, barW, barH)

        // top tick / wick
        const wickH = barH * 0.25
        ctx.fillStyle = 'rgba(180, 83, 9, 0.45)'
        ctx.fillRect(bx + barW * 0.35, by - wickH, barW * 0.3, wickH)
      }

      /* right-side line on top of bars */
      const RIGHT_STEP = BAR_AREA_W / (BAR_COUNT - 1)
      ctx.beginPath()
      for (let i = 0; i < BAR_COUNT; i++) {
        const bx   = BAR_X_START + i * RIGHT_STEP
        const barH = Math.abs(barData[i])
        const by   = H - barH - barH * 0.25
        i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)
      }
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.75)'
      ctx.lineWidth   = 1.2
      ctx.shadowColor = 'rgba(180, 83, 9, 0.2)'
      ctx.shadowBlur  = 4
      ctx.stroke()
      ctx.shadowBlur  = 0

      /* ── vignette / edge fade ── */
      const vignette = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, W*0.75)
      vignette.addColorStop(0, 'rgba(255,255,255,0)')
      vignette.addColorStop(1, 'rgba(248, 250, 252, 0.65)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)
    }

    init()
    draw()

    const onResize = () => { init() }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
