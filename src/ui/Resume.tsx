import { motion } from 'framer-motion'
import { portfolio } from '../data/portfolio'

const ease = [0.22, 1, 0.36, 1] as const

export default function Resume({ activeFocus }: { activeFocus: number }) {
  return (
    <section className="resume" id="resume" aria-labelledby="resume-title">
      <motion.h2
        className="resume-title"
        id="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease }}
      >
        Résumé
      </motion.h2>
      <div className="timeline">
        {portfolio.resume.map((entry, index) => (
          <motion.article
            key={entry.id}
            className={`tl-entry${activeFocus === index ? ' is-active' : ''}`}
            id={entry.id}
            data-point={entry.id}
            aria-current={activeFocus === index ? 'step' : undefined}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: activeFocus === index ? 1 : 0.72, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
            transition={{ duration: 0.7, ease, delay: index * 0.03 }}
          >
            <span className="tl-dot" aria-hidden="true" />
            <div className="tl-body">
              <div className="tl-period">{entry.period}</div>
              <div className="tl-head">
                <span className="tl-focus-number" aria-hidden="true">0{index + 1}</span>
                <h3 className="tl-place">{entry.place}</h3>
              </div>
              <p className="tl-role">{entry.role}</p>
              <ul className="tl-points">
                {entry.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
