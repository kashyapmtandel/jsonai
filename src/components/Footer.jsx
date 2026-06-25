import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <p className="footer-built">
            Built with{' '}
            <Heart size={14} className="footer-heart" fill="currentColor" />{' '}
            by the JSON AI Team &copy; {year}
          </p>
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        <p className="footer-privacy">
          🔒 All processing happens in your browser &mdash; your data never leaves your machine.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
