import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.offsetWidth || window.innerWidth
    let height = container.offsetHeight || window.innerHeight

    // ── 1. Scene, Camera, Transparent Renderer ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 0, 50)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // Fully transparent background
    container.appendChild(renderer.domElement)

    // ── 2. Floating Cyber Ambient Particles (Cool Cyan & Star White) ──
    const count = 220
    const coords = new Float32Array(count * 3)
    const velocities = []

    for (let i = 0; i < count * 3; i += 3) {
      coords[i] = (Math.random() - 0.5) * 160
      coords[i + 1] = (Math.random() - 0.5) * 80
      coords[i + 2] = (Math.random() - 0.5) * 100

      velocities.push({
        vx: (Math.random() - 0.5) * 0.02,
        vy: Math.random() * 0.025 + 0.01,
        vz: (Math.random() - 0.5) * 0.02,
      })
    }

    const particlesGeo = new THREE.BufferGeometry()
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(coords, 3))
    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.5,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(particlesGeo, particlesMat)
    scene.add(points)

    // ── 3. Mouse Interactive Parallax ──
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // ── 4. Animation Loop ──
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse follow
      targetX = mouseX * 4
      targetY = mouseY * 2.5
      camera.position.x += (targetX - camera.position.x) * 0.03
      camera.position.y += (targetY - camera.position.y) * 0.03
      camera.lookAt(0, 0, 0)

      // Drift particles upward gently
      const pos = particlesGeo.attributes.position.array
      for (let i = 0; i < count; i++) {
        const idx = i * 3
        pos[idx] += velocities[i].vx
        pos[idx + 1] += velocities[i].vy
        pos[idx + 2] += velocities[i].vz

        // Wrap around bounds
        if (pos[idx + 1] > 45) pos[idx + 1] = -45
        if (pos[idx] > 85) pos[idx] = -85
        if (pos[idx] < -85) pos[idx] = 85
      }
      particlesGeo.attributes.position.needsUpdate = true

      // Gentle breathing pulse
      particlesMat.opacity = 0.45 + Math.sin(elapsedTime * 1.5) * 0.12

      renderer.render(scene, camera)
    }

    animate()

    // ── 5. Resize ──
    const onResize = () => {
      if (!container) return
      width = container.offsetWidth || window.innerWidth
      height = container.offsetHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // ── 6. Cleanup ──
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      particlesGeo.dispose()
      particlesMat.dispose()
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
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
