import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import PostJobModal from '../components/Jobs/PostJobModal.jsx';
import { api } from '../services/api';



const trustItems = [
  {
    title: 'Verified Pros',
    copy: 'Profiles, portfolios, and work history in one place',
    icon: '/verified-icon.svg',
    accent: 'blue',
  },
  {
    title: 'Secure Payments',
    copy: 'M-Pesa STK payments with escrow-style tracking',
    icon: '/payment-icon.svg',
    accent: 'orange',
  },
  {
    title: 'Quality Control',
    copy: 'Progress updates, completion records, and reviews',
    icon: '/quality-icon.svg',
    accent: 'purple',
  },
]

const workflowItems = [
  {
    step: '01',
    title: 'Post the work',
    copy: 'Share the location, budget, photos, and project details so qualified workers know exactly what you need.',
  },
  {
    step: '02',
    title: 'Review quotations',
    copy: 'Compare worker profiles, portfolio work, timelines, and quoted prices before accepting the right offer.',
  },
  {
    step: '03',
    title: 'Pay and track progress',
    copy: 'Use M-Pesa payment flow, follow progress updates, and release confidence with every completed milestone.',
  },
]

function Home() {
  const [showPostJob, setShowPostJob] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [gatingLoading, setGatingLoading] = useState(false);

  async function openPostJob() {
    setGatingLoading(true);
    setShowPopup(false);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("access");

      if (!token || !user) {
        setShowPopup(true);
        return;
      }

      if (user.user_type !== "customer") {
        setShowPopup(true);
        return;
      }

      await api.get("customerprofile/");
      setShowPostJob(true);
    } catch (e) {
      setShowPopup(true);
    } finally {
      setGatingLoading(false);
    }
  }


  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <h1 id="home-title" className="home-hero__title">
            Construction hiring,
            <span>built for trust.</span>
          </h1>

          <p className="home-hero__lead">
            MjengoOS helps customers post jobs, receive quotations from verified workers,
            manage projects, track progress updates, and keep payments accountable from first
            contact to final review.
          </p>

          <div className="home-hero__actions" aria-label="Primary actions">
<button
              type="button"
              className="home-hero__button home-hero__button--primary"
              onClick={openPostJob}
              disabled={gatingLoading}
            >
              Post a Job
            </button>

            <Link className="home-hero__button home-hero__button--secondary" to="/find-jobs">
              Browse Jobs
            </Link>
          </div>

          <div className="home-hero__audiences" aria-label="Who MjengoOS supports">
            <article>
              <strong>For customers</strong>
              <span>Hire skilled construction talent and keep every project visible.</span>
            </article>
            <article>
              <strong>For workers</strong>
              <span>Show your portfolio, send quotations, and win serious work.</span>
            </article>
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
          <div className="home-hero__status-card">
            <span>Project flow</span>
            <strong>Job to completion</strong>
          </div>
          <div className="home-hero__building-wrap">
            <img className="home-hero__building" src="/building.png" alt="" />
          </div>
          <div className="home-hero__metric">
            <span className="home-hero__metric-dot" />
            <strong>Quotes, payments, updates, reviews</strong>
          </div>
        </div>
      </section>

      <section className="home-flow" aria-label="How MjengoOS works">
        <div className="home-flow__steps">
          {workflowItems.map((item) => (
            <article className="flow-card" key={item.step}>
              <span>{item.step}</span>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {showPopup && (
        <div className="home-login-popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="home-login-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="home-login-popup__title">
              Customer profile required
            </h2>
            <p className="home-login-popup__text">
              You have to login with a customerprofile so as to post a job
            </p>
            <div className="home-login-popup__actions">
              <button
                className="home-login-popup__close"
                type="button"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PostJobModal
        isOpen={showPostJob}
        onClose={() => setShowPostJob(false)}
        onJobCreated={() => window.location.reload()}
      />
    </main>
  )
}

export default Home
