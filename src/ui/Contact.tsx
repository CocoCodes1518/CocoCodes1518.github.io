import { openResume } from '../lib/openResume'
import { portfolio } from '../data/portfolio'

function ContactValue({ label, value, placeholder, href }: { label: string; value: string; placeholder: string; href?: string }) {
  return (
    <div className="contact-line">
      <span className="contact-label">{label}</span>
      {value && href
        ? <a className="contact-value" href={href}>{value}</a>
        : <span className={`contact-value${value ? '' : ' is-placeholder'}`}>{value || placeholder}</span>}
    </div>
  )
}

export default function Contact() {
  const resumeHref = portfolio.links.resume || '#resume'
  const emailHref = portfolio.contact.email ? `mailto:${portfolio.contact.email}` : undefined
  const phoneHref = portfolio.contact.phone ? `tel:${portfolio.contact.phone.replace(/[^\d+]/g, '')}` : undefined
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="closing-shell">
        <div className="closing-kicker"><span>THE DOOR IS OPEN</span><span>02 / 02</span></div>
        <div className="contact-layout">
          <div className="contact-copy">
            <h2 id="contact-title">Let’s talk.</h2>
            {portfolio.contact.intro && <p className="contact-intro">{portfolio.contact.intro}</p>}
            <a className="contact-resume" onClick={openResume} href={resumeHref} target={portfolio.links.resume ? '_blank' : undefined} rel={portfolio.links.resume ? 'noreferrer' : undefined}>VIEW RÉSUMÉ ↗</a>
          </div>
          <div className="contact-details" aria-label="Contact details">
            <ContactValue label="EMAIL" value={portfolio.contact.email} placeholder="YOUR EMAIL GOES HERE" href={emailHref} />
            <ContactValue label="PHONE" value={portfolio.contact.phone} placeholder="PHONE (OPTIONAL)" href={phoneHref} />
            <ContactValue label="LOCATION" value={portfolio.contact.location} placeholder="CITY / TIME ZONE" />
          </div>
        </div>
        <footer className="closing-footer"><span>© {new Date().getFullYear()} {portfolio.identity.name}</span><a href="#top">BACK TO THE TOP ↑</a><span>END OF PAGE</span></footer>
      </div>
    </section>
  )
}
