import RouteLink from './RouteLink';
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
            <RouteLink to="/about">About Us</RouteLink>
            <RouteLink to="/contact">Contact</RouteLink>
            <RouteLink to="/privacy">Privacy Policy</RouteLink>
            <RouteLink to="/terms">Terms of Service</RouteLink>
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
