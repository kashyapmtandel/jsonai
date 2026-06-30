import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './SeoContent.css';

const updateMetaTag = (selector, content) => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('content', content);
    return element;
  }
  return null;
};

const updateLinkHref = (selector, href) => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('href', href);
    return element;
  }
  return null;
};

export default function SeoContent({ title, description, features, faq }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Keep it open by default
    setIsExpanded(true);
  }, [location.pathname]);

  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const originalOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const originalOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const originalTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    const originalTwitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
    const originalOgUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
    const originalCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

    const pageTitle = title ? `${title} | JSON AI` : originalTitle;
    const pageDescription = description && description.length > 0 ? description[0] : originalDescription;
    const pageUrl = `${window.location.origin}${window.location.pathname}`;

    document.title = pageTitle;
    updateMetaTag('meta[name="description"]', pageDescription);
    updateMetaTag('meta[property="og:title"]', pageTitle);
    updateMetaTag('meta[property="og:description"]', pageDescription);
    updateMetaTag('meta[name="twitter:title"]', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', pageDescription);
    updateMetaTag('meta[property="og:url"]', pageUrl);
    updateLinkHref('link[rel="canonical"]', pageUrl);

    // Dynamic SoftwareApplication Schema.org Markup
    const toolSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": title || "JSON AI",
      "url": pageUrl,
      "description": pageDescription,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript and a modern web browser.",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'dynamic-tool-schema';
    schemaScript.text = JSON.stringify(toolSchema);
    document.head.appendChild(schemaScript);

    return () => {
      document.title = originalTitle;
      updateMetaTag('meta[name="description"]', originalDescription);
      updateMetaTag('meta[property="og:title"]', originalOgTitle);
      updateMetaTag('meta[property="og:description"]', originalOgDesc);
      updateMetaTag('meta[name="twitter:title"]', originalTwitterTitle);
      updateMetaTag('meta[name="twitter:description"]', originalTwitterDesc);
      updateMetaTag('meta[property="og:url"]', originalOgUrl);
      updateLinkHref('link[rel="canonical"]', originalCanonical);

      const existingSchema = document.getElementById('dynamic-tool-schema');
      if (existingSchema) {
        existingSchema.remove();
      }
    };
  }, [title, description]);

  const faqSchema = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  } : null;

  return (
    <div className="seo-content-wrapper">
      {faqSchema && (
        <script
          type="application/ld+json"
          id="dynamic-faq-schema"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="seo-content-article">
        <h2>{title}</h2>
        <div className="seo-description">
          {description.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {features && features.length > 0 && (
          <div className="seo-features">
            <h3>Key Features</h3>
            <ul>
              {features.map((feature, idx) => (
                <li key={idx}>
                  <strong>{feature.title}:</strong> {feature.desc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {faq && faq.length > 0 && (
          <div className="seo-faq">
            <h3>Frequently Asked Questions</h3>
            {faq.map((item, idx) => (
              <div key={idx} className="faq-item">
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
