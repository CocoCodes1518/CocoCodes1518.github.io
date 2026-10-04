import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'framer-motion'
import { portfolio } from './data/portfolio'
import Scene, { type SceneControls } from './scene/Scene'
import Resume from './ui/Resume'
import { openResume } from './lib/openResume'
import Works from './ui/Works'
import WhyNotHire from './ui/WhyNotHire'
import Contact from './ui/Contact'
import NoiseOverlay from './ui/NoiseOverlay'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothstep = (value: number) => value * value * (3 - 2 * value)
const dwell = (t: number) => {
  const edge = 0.2
  if (t < edge) return 0
  if (t > 1 - edge) return 1
  return smoothstep((t - edge) / (1 - 2 * edge))
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.12c-3.1.68-3.75-1.32-3.75-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 1.96 3.49 1.45.1-.72.39-1.22.71-1.5-2.47-.28-5.07-1.23-5.07-5.5 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.43.11-2.97 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.22 2.69.11 2.97.72.78 1.15 1.78 1.15 3.01 0 4.28-2.6 5.21-5.08 5.48.4.35.76 1.02.76 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  )
}

function ActionHeader() {
  const github = portfolio.links.github.trim()
  const resume = portfolio.links.resume.trim() || '#resume'
  return (
    <nav className="site-actions" aria-label="Portfolio links">
      {portfolio.links.socials.map((social) => (
        <a className="site-social" key={social.label} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>{social.mark}</a>
      ))}
      {github ? (
        <a className="github-button" href={github} target="_blank" rel="noreferrer" aria-label="Open GitHub portfolio"><GitHubIcon /><span>GITHUB</span></a>
      ) : (
        <button className="github-button is-placeholder" type="button" disabled aria-label="GitHub link will be added after deployment" title="GitHub link will be added after deployment"><GitHubIcon /><span>GITHUB</span></button>
      )}
      <a className="resume-button" onClick={openResume} href={resume} target={portfolio.links.resume ? '_blank' : undefined} rel={portfolio.links.resume ? 'noreferrer' : undefined}>
        RÉSUMÉ <span aria-hidden="true">↗</span>
      </a>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="about-title">
      <ActionHeader />
      <motion.div className="about" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.15 }}>
        <div className="about-intro">
          {portfolio.identity.discipline.trim() && <p className="about-kicker">{portfolio.identity.discipline}</p>}
          <h1 className="about-title" id="about-title">About {portfolio.identity.name}</h1>
          <p className="about-body">{portfolio.identity.intro}</p>
        </div>
      </motion.div>
      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue-label">SCROLL</span>
        <span className="scroll-cue-track"><i className="scroll-cue-dot" /></span>
      </div>
    </section>
  )
}

export default function App() {
  const controlsRef = useRef<SceneControls>({ focus: -1, works: 0, pointerX: 0, pointerY: 0, reduceMotion: false })
  const worksRef = useRef<HTMLElement>(null)
  const [activeFocus, setActiveFocus] = useState(-1)
  const { scrollY } = useScroll()
  const scrimOpacity = useTransform(scrollY, [0, 1600], [0, 0.72])
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  useEffect(() => {
    document.title = `${portfolio.identity.name} — Portfolio`
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    controlsRef.current.reduceMotion = prefersReduced.matches

    let frame = 0
    const updateScene = () => {
      frame = 0
      const anchors = portfolio.resume.map((entry) => document.querySelector<HTMLElement>(`[data-point="${entry.id}"]`))
      if (anchors.every(Boolean)) {
        const topLine = window.scrollY + window.innerHeight * 0.3
        const tops = anchors.map((element) => element!.getBoundingClientRect().top + window.scrollY)
        let focus = -1
        if (topLine <= tops[0]) {
          const heroScroll = Math.max(1, tops[0] - window.innerHeight * 0.3)
          focus = -1 + dwell(clamp(window.scrollY / heroScroll, 0, 1))
        } else if (topLine >= tops[tops.length - 1]) {
          focus = portfolio.resume.length - 1
        } else {
          for (let index = 0; index < tops.length - 1; index += 1) {
            if (topLine <= tops[index + 1]) {
              const t = (topLine - tops[index]) / Math.max(1, tops[index + 1] - tops[index])
              focus = index + dwell(clamp(t, 0, 1))
              break
            }
          }
        }
        controlsRef.current.focus = focus
        const nextActive = focus < -0.45 ? -1 : clamp(Math.round(focus), 0, portfolio.resume.length - 1)
        setActiveFocus((current) => current === nextActive ? current : nextActive)
      }

      const gallery = document.querySelector<HTMLElement>('.wk-gallery')
      if (gallery) {
        const top = gallery.getBoundingClientRect().top
        controlsRef.current.works = clamp((window.innerHeight - top) / Math.max(1, window.innerHeight * 0.7), 0, 1)
      }
    }
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(updateScene) }
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || prefersReduced.matches) return
      controlsRef.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      controlsRef.current.pointerY = 1 - (event.clientY / window.innerHeight) * 2
    }
    const onMotionPreferenceChange = () => { controlsRef.current.reduceMotion = prefersReduced.matches }

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    prefersReduced.addEventListener('change', onMotionPreferenceChange)
    requestUpdate()
    let hashFrame = window.requestAnimationFrame(() => {
      hashFrame = window.requestAnimationFrame(() => {
        const anchorId = window.location.hash.slice(1)
        if (!anchorId) return
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
        requestUpdate()
      })
    })
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('pointermove', onPointerMove)
      prefersReduced.removeEventListener('change', onMotionPreferenceChange)
      if (frame) window.cancelAnimationFrame(frame)
      if (hashFrame) window.cancelAnimationFrame(hashFrame)
    }
  }, [])

  return (
    <>
      <div className="scene-bg" aria-hidden="true">
        <Canvas camera={{ position: [0, 0.05, 11.7], fov: 36, near: 0.1, far: 80 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
          <Suspense fallback={null}><Scene controlsRef={controlsRef} activeFocus={activeFocus} /></Suspense>
        </Canvas>
      </div>
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <motion.div className="glass-rail" style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span><span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span><span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl"><span className="hm-name">{portfolio.identity.name}</span>{portfolio.identity.role}</div>
        <div className="hero-meta hm-tr">PERSONAL PORTFOLIO<br />{new Date().getFullYear()}</div>
        <div className="hero-meta hm-bl">{portfolio.identity.location}</div>
        <div className="hero-meta hm-right">A STORY IN FIVE CHAPTERS</div>
      </motion.div>
      <main className="content">
        <Hero />
        <Resume activeFocus={activeFocus} />
        <Works innerRef={worksRef} />
        <WhyNotHire />
        <Contact />
      </main>
      <motion.div className="hero-gradient" style={{ opacity: heroChromeOpacity }} aria-hidden="true" />
      <div className="stage-fog" aria-hidden="true" />
      <NoiseOverlay />
    </>
  )
}
