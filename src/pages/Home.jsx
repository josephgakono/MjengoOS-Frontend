import { Link } from 'react-router-dom'

const trustItems = [
  {
    title: 'Verified Pros',
    copy: 'Vetted workers only',
    icon: '/verified-icon.svg',
    accent: 'blue',
  },
  {
    title: 'Secure Payments',
    copy: 'Protected escrow flow',
    icon: '/payment-icon.svg',
    accent: 'orange',
  },
  {
    title: 'Quality Control',
    copy: 'Clear standards on every job',
    icon: '/quality-icon.svg',
    accent: 'purple',
  },
]

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <h1 id="home-title" className="home-hero__title">
            Find skilled workers.
            <span>Build with confidence.</span>
          </h1>

          <p className="home-hero__lead">
            MjengoOS connects you with verified construction professionals, secure hiring workflows,
            and project-ready confidence.
          </p>

          <div className="home-hero__actions" aria-label="Primary actions">
            <Link className="home-hero__button home-hero__button--primary" to="/post-job">
              Post a Job
            </Link>
            <Link className="home-hero__button home-hero__button--secondary" to="/find-jobs">
              Find Jobs
            </Link>
          </div>

          <div className="home-hero__trust" aria-label="Platform assurances">
            {trustItems.map((item) => (
              <article className={`trust-card trust-card--${item.accent}`} key={item.title}>
                <span className="trust-card__icon" aria-hidden="true">
                  <img src={item.icon} alt="" />
                </span>
                <span className="trust-card__text">
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__accent home-hero__accent--blue" />
          <div className="home-hero__accent home-hero__accent--orange" />
          <div className="home-hero__building-wrap">
            <img className="home-hero__building" src="/building.png" alt="" />
          </div>
          <div className="home-hero__metric">
            <span className="home-hero__metric-dot" />
            <strong>24h average match time</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
