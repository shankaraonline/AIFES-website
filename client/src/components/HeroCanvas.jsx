import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * AI Innovation Neural Network & Cyber Particles Canvas
 * Renders an interactive 3D neural graph with connected synapse lines,
 * floating data nodes, and interactive cursor connections.
 */
export default function HeroCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.offsetWidth || window.innerWidth
    let height = container.offsetHeight || window.innerHeight

    let animId = null
    let isCleanedUp = false

    // Mouse coordinates (normalized -1 to 1 and pixel coords)
    let mouseX = 0
    let mouseY = 0
    let mousePxX = -9999
    let mousePxY = -9999

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      mousePxX = e.clientX - rect.left
      mousePxY = e.clientY - rect.top
    }

    const onMouseLeave = () => {
      mouseX = 0
      mouseY = 0
      mousePxX = -9999
      mousePxY = -9999
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave, { passive: true })

    // ── Three.js WebGL Implementation ──
    let webglSuccess = false
    let renderer = null
    let scene = null
    let camera = null
    let points = null
    let linesMesh = null
    let particlesGeo = null
    let linesGeo = null
    let particlesMat = null
    let linesMat = null

    try {
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
      camera.position.set(0, 0, 75)

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.inset = '0'
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      container.appendChild(renderer.domElement)

      // ── Neural Network Nodes ──
      const NODE_COUNT = 110
      const nodePos = new Float32Array(NODE_COUNT * 3)
      const nodeColors = new Float32Array(NODE_COUNT * 3)
      const velocities = []

      for (let i = 0; i < NODE_COUNT; i++) {
        const idx = i * 3
        nodePos[idx]     = (Math.random() - 0.5) * 160
        nodePos[idx + 1] = (Math.random() - 0.5) * 90
        nodePos[idx + 2] = (Math.random() - 0.5) * 80

        // Star White / Silver (80%), S&P Red (20%)
        const rand = Math.random()
        if (rand < 0.8) {
          nodeColors[idx] = 0.92; nodeColors[idx + 1] = 0.94; nodeColors[idx + 2] = 0.98
        } else {
          nodeColors[idx] = 0.85; nodeColors[idx + 1] = 0.12; nodeColors[idx + 2] = 0.2
        }

        velocities.push({
          vx: (Math.random() - 0.5) * 0.045,
          vy: (Math.random() - 0.5) * 0.045,
          vz: (Math.random() - 0.5) * 0.035,
        })
      }

      particlesGeo = new THREE.BufferGeometry()
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
      particlesGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3))

      particlesMat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      points = new THREE.Points(particlesGeo, particlesMat)
      scene.add(points)

      // ── Dynamic Synaptic Connection Lines ──
      const MAX_LINES = 1200
      const linePositions = new Float32Array(MAX_LINES * 6)
      const lineColors = new Float32Array(MAX_LINES * 6)

      linesGeo = new THREE.BufferGeometry()
      linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
      linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))

      linesMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      linesMesh = new THREE.LineSegments(linesGeo, linesMat)
      scene.add(linesMesh)

      const CONNECT_DIST = 26
      const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST

      const clock = new THREE.Clock()

      const animateWebGL = () => {
        if (isCleanedUp) return
        animId = requestAnimationFrame(animateWebGL)
        const t = clock.getElapsedTime()

        // Smooth mouse perspective parallax
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.03
        camera.position.y += (mouseY * 3.5 - camera.position.y) * 0.03
        camera.lookAt(0, 0, 0)

        const pArr = particlesGeo.attributes.position.array

        // Update node positions with gentle floating
        for (let i = 0; i < NODE_COUNT; i++) {
          const idx = i * 3
          pArr[idx]     += velocities[i].vx
          pArr[idx + 1] += velocities[i].vy
          pArr[idx + 2] += velocities[i].vz

          // Bounce back inside virtual box
          if (pArr[idx] > 80 || pArr[idx] < -80) velocities[i].vx *= -1
          if (pArr[idx + 1] > 45 || pArr[idx + 1] < -45) velocities[i].vy *= -1
          if (pArr[idx + 2] > 40 || pArr[idx + 2] < -40) velocities[i].vz *= -1
        }
        particlesGeo.attributes.position.needsUpdate = true

        // Build dynamic synaptic lines between nearby nodes
        let lineIdx = 0
        const lPos = linesGeo.attributes.position.array
        const lCol = linesGeo.attributes.color.array

        for (let i = 0; i < NODE_COUNT; i++) {
          const i3 = i * 3
          const x1 = pArr[i3], y1 = pArr[i3 + 1], z1 = pArr[i3 + 2]

          for (let j = i + 1; j < NODE_COUNT; j++) {
            if (lineIdx >= MAX_LINES) break

            const j3 = j * 3
            const x2 = pArr[j3], y2 = pArr[j3 + 1], z2 = pArr[j3 + 2]

            const dx = x1 - x2
            const dy = y1 - y2
            const dz = z1 - z2
            const dSq = dx * dx + dy * dy + dz * dz

            if (dSq < CONNECT_DIST_SQ) {
              const alpha = Math.max(0.05, 1 - Math.sqrt(dSq) / CONNECT_DIST)
              const segIdx = lineIdx * 6

              lPos[segIdx]     = x1; lPos[segIdx + 1] = y1; lPos[segIdx + 2] = z1
              lPos[segIdx + 3] = x2; lPos[segIdx + 4] = y2; lPos[segIdx + 5] = z2

              // Subtle glowing silver-white lines
              lCol[segIdx]     = 0.85 * alpha; lCol[segIdx + 1] = 0.85 * alpha; lCol[segIdx + 2] = 0.9 * alpha
              lCol[segIdx + 3] = 0.85 * alpha; lCol[segIdx + 4] = 0.85 * alpha; lCol[segIdx + 5] = 0.9 * alpha

              lineIdx++
            }
          }
        }

        linesGeo.setDrawRange(0, lineIdx * 2)
        linesGeo.attributes.position.needsUpdate = true
        linesGeo.attributes.color.needsUpdate = true

        // Ambient breathing pulse
        particlesMat.opacity = 0.75 + Math.sin(t * 1.8) * 0.2

        renderer.render(scene, camera)
      }

      animateWebGL()
      webglSuccess = true
    } catch (e) {
      console.warn('HeroCanvas: WebGL unavailable, falling back to 2D AI graph canvas', e)
      webglSuccess = false
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }

    // ── 2D Neural Network Fallback ──
    let fallbackCanvas = null
    let fallbackCtx = null
    if (!webglSuccess) {
      fallbackCanvas = document.createElement('canvas')
      fallbackCanvas.style.position = 'absolute'
      fallbackCanvas.style.inset = '0'
      fallbackCanvas.style.width = '100%'
      fallbackCanvas.style.height = '100%'
      fallbackCanvas.style.pointerEvents = 'none'
      container.appendChild(fallbackCanvas)
      fallbackCtx = fallbackCanvas.getContext('2d')
      fallbackCanvas.width = width
      fallbackCanvas.height = height

      const COUNT_2D = 85
      const nodes2D = []
      for (let i = 0; i < COUNT_2D; i++) {
        const isRed = Math.random() < 0.15
        const isWhite = !isRed && Math.random() < 0.15
        nodes2D.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2.2 + 1.2,
          color: isRed ? '212, 28, 48' : '230, 235, 245',
        })
      }

      const animate2D = () => {
        if (isCleanedUp) return
        animId = requestAnimationFrame(animate2D)
        fallbackCtx.clearRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)

        const maxDist = 115
        const maxDistSq = maxDist * maxDist

        // Draw connections
        for (let i = 0; i < COUNT_2D; i++) {
          const n1 = nodes2D[i]
          n1.x += n1.vx
          n1.y += n1.vy

          if (n1.x < 0 || n1.x > fallbackCanvas.width) n1.vx *= -1
          if (n1.y < 0 || n1.y > fallbackCanvas.height) n1.vy *= -1

          // Connect nearby nodes
          for (let j = i + 1; j < COUNT_2D; j++) {
            const n2 = nodes2D[j]
            const dx = n1.x - n2.x
            const dy = n1.y - n2.y
            const distSq = dx * dx + dy * dy

            if (distSq < maxDistSq) {
              const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.4
              fallbackCtx.beginPath()
              fallbackCtx.moveTo(n1.x, n1.y)
              fallbackCtx.lineTo(n2.x, n2.y)
              fallbackCtx.strokeStyle = `rgba(220, 225, 235, ${alpha})`
              fallbackCtx.lineWidth = 0.9
              fallbackCtx.stroke()
            }
          }

          // Connect to mouse if nearby
          if (mousePxX > 0) {
            const mdx = n1.x - mousePxX
            const mdy = n1.y - mousePxY
            const mDistSq = mdx * mdx + mdy * mdy
            if (mDistSq < 140 * 140) {
              const mAlpha = (1 - Math.sqrt(mDistSq) / 140) * 0.65
              fallbackCtx.beginPath()
              fallbackCtx.moveTo(n1.x, n1.y)
              fallbackCtx.lineTo(mousePxX, mousePxY)
              fallbackCtx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`
              fallbackCtx.lineWidth = 1.2
              fallbackCtx.stroke()
            }
          }

          // Draw node circle
          fallbackCtx.beginPath()
          fallbackCtx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2)
          fallbackCtx.fillStyle = `rgba(${n1.color}, 0.9)`
          fallbackCtx.shadowColor = `rgba(${n1.color}, 0.8)`
          fallbackCtx.shadowBlur = 6
          fallbackCtx.fill()
        }
      }
      animate2D()
    }

    // ── Resize ──
    const onResize = () => {
      if (!container) return
      width = container.offsetWidth || window.innerWidth
      height = container.offsetHeight || window.innerHeight

      if (webglSuccess && renderer && camera) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      } else if (fallbackCanvas) {
        fallbackCanvas.width = width
        fallbackCanvas.height = height
      }
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ──
    return () => {
      isCleanedUp = true
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)

      if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        if (typeof renderer.forceContextLoss === 'function') {
          renderer.forceContextLoss()
        }
        renderer.dispose()
      }

      if (particlesGeo) particlesGeo.dispose()
      if (particlesMat) particlesMat.dispose()
      if (linesGeo) linesGeo.dispose()
      if (linesMat) linesMat.dispose()

      if (fallbackCanvas && fallbackCanvas.parentNode) {
        fallbackCanvas.parentNode.removeChild(fallbackCanvas)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
