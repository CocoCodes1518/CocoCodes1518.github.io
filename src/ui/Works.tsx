import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { portfolio, type WorkItem, type WorkSection } from '../data/portfolio'

const ease = [0.22, 1, 0.36, 1] as const

type OpenWork = (item: WorkItem, opener: HTMLButtonElement) => void

function WorkLine({ item, onOpen }: { item: WorkItem; onOpen: OpenWork }) {
  return (
    <li className="wk-line">
      <button className="wk-line-btn" type="button" onClick={(event) => onOpen(item, event.currentTarget)} aria-haspopup="dialog">
        <span className="wk-line-name">{item.name}</span>
        <span className="wk-line-meta">
          {item.meta && <span className="wk-line-num">{item.meta}</span>}
          {item.tags?.map((tag, index) => <span className="wk-line-tag" key={`${tag}-${index}`}>{tag}</span>)}
        </span>
      </button>
    </li>
  )
}

function SectionCard({ section, onOpen }: { section: WorkSection; onOpen: OpenWork }) {
  return (
    <article className="wk-card" aria-label={`${section.number} ${section.title}`}>
      <div className="wk-card-head">
        <span className="wk-card-no">{section.number}</span>
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      <div className={`wk-card-cover${section.coverFit ? ' is-contain' : ''}`} aria-label={section.coverUrl ? `${section.title} cover image` : `Reserved for ${section.coverLabel}`}>
        {section.coverUrl ? <img src={section.coverUrl} alt={`${section.title} project cover`} /> : (
          <div className="wk-card-cover-ph">
            <span className="wk-card-cover-no">{section.number}</span>
            <span className="wk-card-cover-label">{section.coverLabel}</span>
          </div>
        )}
      </div>
      <div className="wk-card-body">
        <ul className="wk-list">
          {section.items.map((item, index) => <WorkLine key={`${section.id}-${index}`} item={item} onOpen={onOpen} />)}
        </ul>
        {section.footer && <div className="wk-foot"><p className="wk-foot-line">{section.footer}</p></div>}
      </div>
    </article>
  )
}

function WorkDetail({ item, onClose, restoreFocus }: { item: WorkItem; onClose: () => void; restoreFocus: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ))
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKey)
      restoreFocus()
    }
  }, [onClose, restoreFocus])

  return (
    <>
      <motion.div className="wk-detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
      <motion.div ref={dialogRef} className="wk-detail" role="dialog" aria-modal="true" aria-labelledby="work-detail-title" tabIndex={-1} initial={{ opacity: 0, scale: 0.985, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.99, y: 6 }} transition={{ duration: 0.35, ease }}>
        <button ref={closeButtonRef} className="wk-detail-close" type="button" onClick={onClose} aria-label="Close project details">×</button>
        {item.coverUrl ? (
          <div className={`wk-detail-banner${item.coverFit ? ' is-contain' : ''}`}><img src={item.coverUrl} alt={`${item.name} project cover`} /></div>
        ) : (
          <div className="wk-detail-banner is-ph" aria-hidden="true"><span className="wk-detail-ph-text">PROJECT IMAGE</span></div>
        )}
        <article className="wk-detail-article">
          <header className="wk-detail-head">
            <h3 className="wk-detail-title" id="work-detail-title">{item.name}</h3>
            {item.meta && <div className="wk-detail-sub">{item.meta}</div>}
            {item.tags && <div className="wk-detail-tags">{item.tags.map((tag) => <span className="wk-badge" key={tag}>{tag}</span>)}</div>}
          </header>
          <p className="wk-detail-desc">{item.description}</p>
          {item.link && <a className="wk-detail-link" href={item.link} target="_blank" rel="noreferrer">VIEW PROJECT <span aria-hidden="true">↗</span></a>}
        </article>
      </motion.div>
    </>
  )
}

export default function Works({ innerRef }: { innerRef: RefObject<HTMLElement> }) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const [scrollRange, setScrollRange] = useState(0)
  const [active, setActive] = useState<WorkItem | null>(null)
  const { scrollYProgress } = useScroll({ target: galleryRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  const hintOpacity = useTransform(scrollYProgress, [0.84, 1], [1, 0])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setScrollRange(Math.max(0, track.scrollWidth - window.innerWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  const open = useCallback((item: WorkItem, opener: HTMLButtonElement) => {
    openerRef.current = opener
    setActive(item)
  }, [])
  const close = useCallback(() => setActive(null), [])
  const restoreFocus = useCallback(() => openerRef.current?.focus(), [])

  return (
    <section className="works" id="works" ref={innerRef} aria-labelledby="works-heading">
      <div className="wk-gallery" ref={galleryRef} style={{ height: `calc(100vh + ${scrollRange}px)` }}>
        <div className="wk-gallery-sticky">
          <h2 className="wk-gallery-title" id="works-heading">Works</h2>
          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {portfolio.works.map((section) => <SectionCard key={section.id} section={section} onOpen={open} />)}
          </motion.div>
          <div className="wk-progress" aria-hidden="true"><motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} /></div>
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">KEEP SCROLLING</motion.span>
        </div>
      </div>
      <AnimatePresence>{active && <WorkDetail key={active.name} item={active} onClose={close} restoreFocus={restoreFocus} />}</AnimatePresence>
    </section>
  )
}
