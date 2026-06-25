import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Braces,
  Sun,
  Moon,
  Menu,
  X,
  Wand2,
  ShieldCheck,
  ArrowLeftRight,
  GitCompare,
  Search,
  FileJson,
  TreePine,
  Sparkles,
  Lock,
  Code2
} from 'lucide-react';
import './Navbar.css';

const navItems = [
  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/formatter', label: 'Formatter', icon: Wand2 },
  { to: '/validator', label: 'Validator', icon: ShieldCheck },
  { to: '/converter', label: 'Converter', icon: ArrowLeftRight },
  { to: '/diff', label: 'Diff', icon: GitCompare },
  { to: '/path-finder', label: 'Path Finder', icon: Search },
  { to: '/schema', label: 'Schema', icon: FileJson },
  { to: '/type-generator', label: 'Type Gen', icon: Code2 },
  { to: '/editor', label: 'Tree Editor', icon: TreePine },
  { to: '/escape', label: 'Escape', icon: Lock },
];

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('json-tools-theme');
    return stored || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('json-tools-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={closeMobile}>
          <Braces size={24} strokeWidth={2.5} />
          <span>JSON AI</span>
        </NavLink>

        <ul className="navbar-links">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
        <ul className="mobile-menu-links">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMobile}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
