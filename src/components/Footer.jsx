import {
  Hammer,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Hammer size={26} />
            <h2>MjengoOS</h2>
          </div>

          <p>
            Connecting customers with skilled construction professionals through
            secure hiring, project management and protected payments.
          </p>

          <div className="footer-socials">
           
            <a href="#">
              Instagram
            </a>
            <a href="#">
              Linkedin
            </a>
            <a href="#">
             Github
            </a>
          </div>
        </div>

        {/* Platform */}
        <div className="footer-links">
          <h3>Platform</h3>

          <a href="/">Home</a>
          <a href="/how-it-works">How It Works</a>
          <a href="/login">Login</a>
          <a href="/signup">Create Account</a>
        </div>

        {/* Services */}
        <div className="footer-links">
          <h3>Services</h3>

          <p>Construction Jobs</p>
          <p>Worker Hiring</p>
          <p>Project Tracking</p>
          <p>Escrow Payments</p>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact</h3>

          <p>
            <Mail size={16} />
            support@mjengoos.com
          </p>

          <p>
            <Phone size={16} />
            +254 700 000 000
          </p>

          <p>
            <MapPin size={16} />
            Nairobi, Kenya
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} MjengoOS. All Rights Reserved.</p>

        
      </div>
    </footer>
  );
}
