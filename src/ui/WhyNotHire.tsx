import { portfolio } from '../data/portfolio'

export default function WhyNotHire() {
  const image = portfolio.whyNotHire.photoUrl
  return (
    <section className="why-section" id="why-not-hire" aria-labelledby="why-title">
      <div className="closing-shell">
        <div className="closing-kicker"><span>THE HONEST BIT</span><span>01 / 02</span></div>
        <div className="why-heading">
          <h2 id="why-title">Why you<br /><em>shouldn’t</em> hire me</h2>
          {portfolio.whyNotHire.intro && <p>{portfolio.whyNotHire.intro}</p>}
        </div>
        <div className="why-list">
          {portfolio.whyNotHire.items.map((item, index) => (
            <article className="why-row" key={`${item.title}-${index}`}>
              <span className="why-number">0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.note}</p></div>
              <span className="why-arrow" aria-hidden="true">↘</span>
            </article>
          ))}
        </div>
        <div className="hire-photo-callout">
          {image ? (
            <img className="hire-photo" src={image} alt="Portrait of the portfolio owner" />
          ) : (
            <div className="hire-photo-placeholder" role="img" aria-label="Reserved space for your portrait">
              <span>YOUR PHOTO<br />GOES HERE</span><small>PORTRAIT / 01</small>
            </div>
          )}
          <p className="please-hire"><span>Please</span><span>hire me!</span></p>
        </div>
      </div>
    </section>
  )
}
