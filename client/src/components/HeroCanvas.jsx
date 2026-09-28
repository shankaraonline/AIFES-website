import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── 1. Sizes — use the mount element's actual dimensions ──
    let W = mount.clientWidth || window.innerWidth
    let H = mount.clientHeight || window.innerHeight

    // ── 2. Scene & Camera ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 800)
    camera.position.set(0, 0, 55)

    // ── 3. Renderer ──
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)
      // Apply position styles directly to the canvas element
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0'
      renderer.domElement.style.left = '0'
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      mount.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('HeroCanvas: WebGL failed', e)
      return
    }

    // ── 4. Wireframe 3D Boxes ──
    const group = new THREE.Group()
    scene.add(group)

    const sizes = [3.2, 5.0, 7.0, 8.0, 2.8, 5.5, 3.8]
    const boxGeos = sizes.map(s => new THREE.BoxGeometry(s, s, s))
    const edgeGeos = boxGeos.map(g => new THREE.EdgesGeometry(g))

    const matRed   = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9,  depthWrite: false })
    const matCyan  = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85, depthWrite: false })
    const matWhite = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8,  depthWrite: false })
    const matFace  = new THREE.MeshBasicMaterial({ color: 0x061120, transparent: true, opacity: 0.4,  depthWrite: false, side: THREE.FrontSide })

    const BOX_COUNT = 40
    const boxes = []

    for (let i = 0; i < BOX_COUNT; i++) {
      const gi  = i % boxGeos.length
      const mat = i % 3 === 0 ? matRed : i % 3 === 1 ? matCyan : matWhite
      const mesh = new THREE.Mesh(boxGeos[gi], matFace)
      const wire = new THREE.LineSegments(edgeGeos[gi], mat)
      const wrap = new THREE.Group()
      wrap.add(mesh)
      wrap.add(wire)
      wrap.position.set(
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80 - 10
      )
      wrap.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
      group.add(wrap)
      boxes.push({
        wrap,
        rx:    (Math.random() - 0.5) * 0.008,
        ry:    (Math.random() - 0.5) * 0.012,
        rz:    (Math.random() - 0.5) * 0.006,
        vy:    0.015 + Math.random() * 0.022,
        vx:    (Math.random() - 0.5) * 0.007,
        freq:  0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // ── 5. Floating Particles ──
    const N = 200
    const pos = new Float32Array(N * 3)
    const vel = []
    for (let i = 0; i < N; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 160
      pos[i * 3 + 1] = (Math.random() - 0.5) * 90
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100
      vel.push({
        vx: (Math.random() - 0.5) * 0.016,
        vy: 0.01 + Math.random() * 0.018,
        vz: (Math.random() - 0.5) * 0.016,
      })
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 2.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    scene.add(new THREE.Points(pGeo, pMat))

    // ── 6. Mouse parallax ──
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / W) * 2 - 1
      my = -(e.clientY / H) * 2 + 1
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // ── 7. Animation ──
    let animId
    let running = true
    const clock = new THREE.Clock()

    const animate = () => {
      if (!running) return
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      camera.position.x += (mx * 5 - camera.position.x) * 0.04
      camera.position.y += (my * 3 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      group.rotation.y += (mx * 0.1 - group.rotation.y) * 0.04
      group.rotation.x += (-my * 0.07 - group.rotation.x) * 0.04

      for (const b of boxes) {
        b.wrap.rotation.x += b.rx
        b.wrap.rotation.y += b.ry
        b.wrap.rotation.z += b.rz
        b.wrap.position.y += b.vy
        b.wrap.position.x += b.vx + Math.sin(t * b.freq + b.phase) * 0.018
        if (b.wrap.position.y > 50) {
          b.wrap.position.y = -50
          b.wrap.position.x = (Math.random() - 0.5) * 140
        }
        if (b.wrap.position.x > 90)  b.wrap.position.x = -90
        if (b.wrap.position.x < -90) b.wrap.position.x = 90
      }

      const p = pGeo.attributes.position.array
      for (let i = 0; i < N; i++) {
        p[i*3]   += vel[i].vx
        p[i*3+1] += vel[i].vy
        p[i*3+2] += vel[i].vz
        if (p[i*3+1] > 50)  p[i*3+1] = -50
        if (p[i*3]   > 90)  p[i*3]   = -90
        if (p[i*3]   < -90) p[i*3]   = 90
      }
      pGeo.attributes.position.needsUpdate = true
      pMat.opacity = 0.6 + Math.sin(t * 1.4) * 0.18

      renderer.render(scene, camera)
    }
    animate()

    // ── 8. Resize — watch mount element dimensions ──
    const onResize = () => {
      W = mount.clientWidth || window.innerWidth
      H = mount.clientHeight || window.innerHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    // Also trigger a resize after mount to ensure sizes are correct
    // (needed because clientWidth/Height may be 0 right after mount)
    const initTimer = setTimeout(onResize, 50)

    // ── 9. Cleanup ──
    return () => {
      running = false
      cancelAnimationFrame(animId)
      clearTimeout(initTimer)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      pGeo.dispose()
      pMat.dispose()
      boxGeos.forEach(g => g.dispose())
      edgeGeos.forEach(g => g.dispose())
      matFace.dispose()
      matRed.dispose()
      matCyan.dispose()
      matWhite.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
