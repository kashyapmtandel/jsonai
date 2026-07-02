import { useState, useEffect, useCallback, useRef } from 'react';
import RouteLink from './RouteLink';
import { Braces, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import tools from '../data/tools';
import './Navbar.css';

const primaryRoutes = ['/ai-assistant/', '/formatter/', '/validator/', '/editor/'];
const primaryNavItems = tools.filter((t) => primaryRoutes.includes(t.to));
const moreNavItems = tools.filter((t) => !primaryRoutes.includes(t.to));

const formatLabel = (title) => title.replace(/^JSON\s+/, '');

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownToggleRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside or when using keyboard navigation
  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const dropdown = dropdownMenuRef.current;
    const toggle = dropdownToggleRef.current;
    const focusableItems = dropdown?.querySelectorAll('a');
    const firstItem = focusableItems?.[0] ?? null;
    const lastItem = focusableItems?.[focusableItems.length - 1] ?? null;

    if (firstItem) {
      firstItem.focus();
    }

    const handleClickOutside = (event) => {
      const dropdownWrapper = document.querySelector('.navbar-dropdown');
      if (dropdownWrapper && !dropdownWrapper.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        toggle?.focus();
        return;
      }

      if (event.key === 'Tab' && dropdown) {
        if (event.shiftKey) {
          if (document.activeElement === firstItem) {
            event.preventDefault();
            toggle?.focus();
          }
        } else {
          if (document.activeElement === lastItem) {
            event.preventDefault();
            firstItem?.focus();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [dropdownOpen]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeNav = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <RouteLink to="/" className="navbar-logo" onClick={closeNav}>
          <Braces size={24} strokeWidth={2.5} />
          <span>JSON AI</span>
        </RouteLink>

        <ul className="navbar-links">
          {primaryNavItems.map(({ to, title }) => (
            <li key={to}>
              <RouteLink
                to={to}
                activeClassName="active"
                onClick={closeNav}
              >
                {formatLabel(title)}
              </RouteLink>
            </li>
          ))}

          <li className={`navbar-dropdown ${dropdownOpen ? 'open' : ''}`}>
            <button
              type="button"
              id="navbar-tools-button"
              ref={dropdownToggleRef}
              className="dropdown-toggle"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-controls="navbar-tools-menu"
              aria-label="Open tools menu"
            >
              More Tools
              <ChevronDown size={16} />
            </button>
            <ul
              id="navbar-tools-menu"
              ref={dropdownMenuRef}
              className="dropdown-menu"
              role="menu"
              aria-labelledby="navbar-tools-button"
            >
              {moreNavItems.map(({ to, title, icon: Icon }) => (
                <li key={to}>
                  <RouteLink
                    to={to}
                    activeClassName="active"
                    onClick={closeNav}
                    role="menuitem"
                  >
                    <Icon size={16} />
                    {formatLabel(title)}
                  </RouteLink>
                </li>
              ))}
            </ul>
          </li>
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
          {tools.map(({ to, title, icon: Icon }) => (
            <li key={to}>
              <RouteLink
                to={to}
                activeClassName="active"
                onClick={closeNav}
              >
                <Icon size={18} />
                {formatLabel(title)}
              </RouteLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
