import RouteLink from './RouteLink';
import { Heart, Braces, Lock } from 'lucide-react';
import './Footer.css';

const CORE_TOOLS = [
  { to: '/ai-assistant/',   label: 'AI Assistant' },
  { to: '/formatter/',      label: 'JSON Formatter' },
  { to: '/validator/',      label: 'JSON Validator' },
  { to: '/editor/',         label: 'Tree Viewer' },
  { to: '/diff/',           label: 'JSON Diff' },
  { to: '/converter/',      label: 'JSON Converter' },
];

const MORE_TOOLS = [
  { to: '/schema/',         label: 'Schema Generator' },
  { to: '/path-finder/',    label: 'Path Finder' },
  { to: '/type-generator/', label: 'Type Generator' },
  { to: '/minifier/',       label: 'JSON Minifier' },
  { to: '/escape/',         label: 'Escape Tool' },
  { to: '/prompt-builder/', label: 'Prompt Builder' },
];

const COMPANY = [
  { to: '/about/',   label: 'About' },
  { to: '/contact/', label: 'Contact' },
  { to: '/privacy/', label: 'Privacy Policy' },
  { to: '/terms/',   label: 'Terms of Service' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── Brand column ── */}
        <div className="footer-col footer-col--brand">
          <RouteLink to="/" className="footer-logo">
            <Braces size={22} strokeWidth={2.5} />
            <span>JSON AI</span>
          </RouteLink>
          <p className="footer-tagline">
            Free, fast, privacy-first JSON tools for developers. Everything runs in your browser — your data never leaves your machine.
          </p>
          <p className="footer-privacy-note">
            <Lock size={11} /> 100% client-side — no server, no tracking
          </p>
        </div>

        {/* ── Core Tools column ── */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Core Tools</h3>
          <ul className="footer-link-list">
            {CORE_TOOLS.map(({ to, label }) => (
              <li key={to}>
                <RouteLink to={to}>{label}</RouteLink>
              </li>
            ))}
          </ul>
        </div>

        {/* ── More Tools column ── */}
        <div className="footer-col">
          <h3 className="footer-col-heading">More Tools</h3>
          <ul className="footer-link-list">
            {MORE_TOOLS.map(({ to, label }) => (
              <li key={to}>
                <RouteLink to={to}>{label}</RouteLink>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Company column ── */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Company</h3>
          <ul className="footer-link-list">
            {COMPANY.map(({ to, label }) => (
              <li key={to}>
                <RouteLink to={to}>{label}</RouteLink>
              </li>
            ))}
            <li>
              <a href="https://x.com/KashyapTan23768" target="_blank" rel="noopener noreferrer">
                Follow on X
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-copy">
          Built with <Heart size={12} className="footer-heart" fill="currentColor" /> by the JSON AI Team &copy; {year}
        </p>
        <p className="footer-copy footer-copy--right">
          Free JSON tools for developers worldwide
        </p>
      </div>
    </footer>
  );
};

export default Footer;
