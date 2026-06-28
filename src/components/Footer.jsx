import RouteLink from './RouteLink';
import { Heart } from 'lucide-react';
import tools from '../data/tools';
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
        <nav className="footer-tool-links" aria-label="JSON tools">
          {tools.map(({ to, title }) => (
            <RouteLink key={to} to={to}>{title}</RouteLink>
          ))}
        </nav>
        <div className="footer-social" aria-label="Social media">
          <a href="https://x.com/jsonaitools" target="_blank" rel="noopener noreferrer">X</a>
        </div>
        <p className="footer-privacy">
          All processing happens in your browser &mdash; your data never leaves your machine.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
