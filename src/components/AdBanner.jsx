import { useEffect, useRef, useState } from 'react';
import './AdBanner.css';

/**
 * A reusable, subtly styled AdSense component.
 * Hides itself gracefully when ads can't load (localhost, ad blockers).
 * 
 * @param {string} slot - The specific ad slot ID from your AdSense dashboard
 * @param {string} client - Your publisher ID (defaults to the one in index.html)
 */
const AdBanner = ({ 
  slot = '', 
  client = 'ca-pub-7135718421741973',
  style = {}
}) => {
  const containerRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Don't attempt to load ads on localhost
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return;
    }

    try {
      if (window && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.warn('AdSense error:', e.message);
      return;
    }

    // Check if ad actually rendered after a delay
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector('ins');
      if (ins && ins.dataset.adStatus === 'filled') {
        setAdLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // On localhost, don't render anything
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }
  }

  return (
    <div
      ref={containerRef}
      className={`ad-banner-container ${adLoaded ? 'ad-banner--loaded' : ''}`}
      style={style}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'none' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
