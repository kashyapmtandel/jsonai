import { Mail } from 'lucide-react';
import RouteLink from '../components/RouteLink';
import './LegalPages.css';

export default function Contact() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <Mail size={48} className="legal-icon" />
        <h1>Contact Us</h1>
      </div>

      <div className="legal-content">
        <section className="contact-section">
          <h2>Get in Touch</h2>
          <p>
            Have a question, feature request, or found a bug? We'd love to hear from you! 
            We are constantly improving JSON AI to make it the best developer utility on the web.
          </p>
          
          <div className="contact-box">
            <h3>Email Support</h3>
            <p>You can reach us directly at:</p>
            <a href="mailto:support@jsonai.online" className="contact-email">support@jsonai.online</a>
          </div>

          <p className="contact-note">
            Please note: Since our tools process data entirely in your browser, we cannot help you recover lost JSON data, 
            as we never have access to it in the first place!
          </p>

          <div className="contact-box">
            <h3>Follow Us</h3>
            <p>Stay updated with new features and tips:</p>
            <a href="https://x.com/KashyapTan23768" target="_blank" rel="noopener noreferrer" className="contact-email">@KashyapTan23768 on X</a>
          </div>

          <p className="contact-note" style={{ marginTop: '2rem' }}>
            Looking for JSON tools? <RouteLink to="/json-formatter/" style={{ color: 'var(--accent-color)' }}>Try our JSON Formatter</RouteLink> or explore 
            all <RouteLink to="/" style={{ color: 'var(--accent-color)' }}>JSON AI tools</RouteLink>.
          </p>
        </section>
      </div>
    </div>
  );
}
