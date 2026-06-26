import { Mail } from 'lucide-react';
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
        </section>
      </div>
    </div>
  );
}
