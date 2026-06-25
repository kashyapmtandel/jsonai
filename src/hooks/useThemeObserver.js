import { useState, useEffect } from 'react';

export const useThemeObserver = () => {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

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
