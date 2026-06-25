import { useState, useEffect } from 'react';

export const useThemeObserver = () => {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage first — this is set by Navbar's useTheme hook and is
    // always correct. Falling back to the DOM attribute can cause a race condition
    // on page load where data-theme hasn't been applied yet.
    return (
      localStorage.getItem('json-tools-theme') ||
      document.documentElement.getAttribute('data-theme') ||
      'dark'
    );
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
};
