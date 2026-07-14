import {
  Building2,
  Hammer,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Target,
  Eye,
} from "lucide-react";

export default function About() {
  return (
    <main className="about-page page-with-navbar-offset">
      <div className="page-container">


      {/* Hero */}

      <section className="about-hero">

        <h1>About MjengoOS</h1>

        <p>
          MjengoOS is a digital construction marketplace that connects
          customers with skilled workers through transparent hiring,
          project management and secure payments.
        </p>

      </section>

      {/* Story */}

      <section className="about-story">

        <div className="story-year">
          <span>2026</span>
        </div>

        <div className="story-content">

          <h2>Our Story</h2>

          <p>
            Construction projects often involve searching for reliable
            workers, comparing quotations, monitoring progress and
            managing payments across different platforms.
          </p>

          <p>
            MjengoOS brings everything together into one modern platform,
            making construction projects simpler, safer and easier to
            manage from beginning to completion.
          </p>

        </div>

      </section>

      {/* Mission & Vision */}

      <section className="about-mission">

        <div className="about-card blue">

          <Target size={34} />

          <h3>Our Mission</h3>

          <p>
            To simplify construction hiring by providing one secure
            platform where customers and skilled workers can connect,
            collaborate and complete projects successfully.
          </p>

        </div>

        <div className="about-card orange">

          <Eye size={34} />

          <h3>Our Vision</h3>

          <p>
            To become Africa's trusted digital construction marketplace,
            transforming how construction projects are managed through
            technology.
          </p>

        </div>

      </section>

      {/* Features */}

      <section className="about-features">

        <h2>What Makes Us Different</h2>

        <div className="about-grid">

          <div className="feature-card">
            <Building2 size={28}/>
            <h4>Construction Focused</h4>
            <p>Designed specifically for construction professionals.</p>
          </div>

          <div className="feature-card">
            <ShieldCheck size={28}/>
            <h4>Secure Hiring</h4>
            <p>Compare quotations before selecting the right worker.</p>
          </div>

          <div className="feature-card">
            <ClipboardList size={28}/>
            <h4>Project Tracking</h4>
            <p>Monitor work progress from start to finish.</p>
          </div>

          <div className="feature-card">
            <CreditCard size={28}/>
            <h4>Protected Payments</h4>
            <p>Secure payment workflow for both customers and workers.</p>
          </div>

        </div>

      </section>

      {/* Why */}

      <section className="about-why">

        <Hammer size={42}/>

        <h2>Why Choose MjengoOS?</h2>

        <p>
          Instead of using multiple applications to hire workers,
          communicate, manage projects and make payments, MjengoOS
          combines everything into one reliable construction platform.
        </p>

      </section>

      {/* Bottom Banner */}

      <section className="about-banner">

        <h2>Building Better Projects Together</h2>

        <p>
          Simple. Transparent. Reliable.
        </p>

      </section>

      </div>
    </main>
  );
}
