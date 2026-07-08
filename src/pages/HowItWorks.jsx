import {
  User,
  HardHat,
  ClipboardList,
  FileText,
  Hammer,
  CreditCard,
  MessageSquare,
  Star,
  ShieldCheck,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <main className="how-page">
      {/* Hero */}
      <section className="how-hero">
        

        <h1>How MjengoOS Works</h1>

        <p>
          MjengoOS connects customers with skilled construction workers through
          secure hiring, project tracking and protected payments.
        </p>
      </section>

      {/* Users */}
      <section className="how-users">
        <div className="user-card blue">
          <User size={32} />

          <h3>Customer</h3>

          <ul>
            <li>Post construction jobs</li>
            <li>Review quotations</li>
            <li>Hire skilled workers</li>
            <li>Track project progress</li>
            <li>Release secure payments</li>
          </ul>
        </div>

        <div className="user-card orange">
          <HardHat size={32} />

          <h3>Worker</h3>

          <ul>
            <li>Browse available jobs</li>
            <li>Submit quotations</li>
            <li>Manage projects</li>
            <li>Upload progress updates</li>
            <li>Receive payments</li>
          </ul>
        </div>
      </section>

     
      {/* Features */}

      <section className="how-features">
        <h2>Everything In One Platform</h2>

        <div className="feature-grid">
          <div className="feature-item">
            <ClipboardList size={22} />
            <span>Job Posting</span>
          </div>

          <div className="feature-item">
            <MessageSquare size={22} />
            <span>Quotations</span>
          </div>

          <div className="feature-item">
            <Hammer size={22} />
            <span>Projects</span>
          </div>

          <div className="feature-item">
            <ShieldCheck size={22} />
            <span>Escrow Payments</span>
          </div>

          <div className="feature-item">
            <Star size={22} />
            <span>Reviews</span>
          </div>

          <div className="feature-item">
            <User size={22} />
            <span>Worker Profiles</span>
          </div>
        </div>
      </section>

      {/* Escrow */}

      <section className="payment-box">
        <h2>Secure Escrow Payments</h2>

        <div className="payment-flow">
          <span>Deposit</span>
          <span>→</span>
          <span>Escrow</span>
          <span>→</span>
          <span>Complete</span>
          <span>→</span>
          <span>Release</span>
        </div>

        <p>
          Payments remain protected until the customer confirms the project has
          been completed successfully.
        </p>
      </section>

      {/* FAQ */}

      <section className="faq-section">
        <h2>Quick Answers</h2>

        <div className="faq-grid">
          <div>
            <strong>Can I receive multiple quotations?</strong>
            <p>Yes. Compare workers before hiring.</p>
          </div>

          <div>
            <strong>Can I monitor my project?</strong>
            <p>Yes. Workers upload continuous progress updates.</p>
          </div>

          <div>
            <strong>When is payment released?</strong>
            <p>Only after project completion and approval.</p>
          </div>

          <div>
            <strong>Can customers leave reviews?</strong>
            <p>Yes. Every completed project can be rated.</p>
          </div>
        </div>
      </section>

      {/* Footer */}

      <section className="why-box">
        <h2>Why MjengoOS?</h2>

        <p>
          MjengoOS brings hiring, quotations, project management, communication,
          reviews and secure payments together in one modern construction
          platform, making projects transparent, organized and reliable from
          beginning to completion.
        </p>
      </section>
    </main>
  );
}
