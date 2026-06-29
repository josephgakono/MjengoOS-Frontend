import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";

import { api } from "../services/api";
import "../styles/contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    category: "issue",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  //--------------------------------------------------
  // Handle Inputs
  //--------------------------------------------------

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  //--------------------------------------------------
  // Submit
  //--------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("feedbacks/", formData);

      setSuccess("Your message has been sent successfully.");

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        category: "issue",
        message: "",
      });
    } catch (err) {
      console.error(err);

      setError("Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // JSX
  //--------------------------------------------------

  return (
    <section className="contact-page">
      <div className="contact-container">
        {/*=====================================
                PAGE HEADER
        =====================================*/}

        <div className="contact-heading">
          <h1>We'd love to hear from you.</h1>

          <p>
            Have a question, found an issue, or simply want to share feedback?
            Reach out to the MjengoOS team.
          </p>
        </div>

        {/*=====================================
                MAIN GRID
        =====================================*/}

        <div className="contact-grid">
          {/*=====================================
                LEFT PANEL
          =====================================*/}

          <div className="contact-info">
            <h2>Get in touch</h2>

            <div className="info-item">
              <MapPin />

              <div>
                <h4>Visit us</h4>
                <p>MjengoOS Headquarters</p>
                <p>Nairobi, Kenya</p>
              </div>
            </div>

            <div className="info-item">
              <Mail />

              <div>
                <h4>Email us</h4>

                <p>support@mjengoos.com</p>

                <p>We reply within 24 hours.</p>
              </div>
            </div>

            <div className="info-item">
              <Phone />

              <div>
                <h4>Call us</h4>

                <p>Monday - Friday</p>

                <p>8:00 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Socials */}

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                {/* lucide-react v1.21.0 does not include brand icon exports */}
                <span>f</span>
              </a>

              <a href="#" aria-label="Instagram">
                <span>◎</span>
              </a>

              <a href="#" aria-label="LinkedIn">
                <span>in</span>
              </a>

              <a href="#" aria-label="Twitter">
                <span>t</span>
              </a>
            </div>
          </div>

          {/*=====================================
                FORM
          =====================================*/}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="double-input">
              <div className="input-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="issue">Issue</option>

                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div className="input-group">
              <label>Message</label>

              <textarea
                rows="7"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            {success && <div className="success-message">{success}</div>}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="contact-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
