import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './SeoContent.css';

const updateMetaTag = (selector, content) => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('content', content);
  }
};

export default function SeoContent({ title, description, features, faq }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const originalOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const originalOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const originalTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    const originalTwitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';

    const pageTitle = title ? `${title} | JSON AI` : originalTitle;
    const pageDescription = description && description.length > 0 ? description[0] : originalDescription;

    document.title = pageTitle;
    updateMetaTag('meta[name="description"]', pageDescription);
    updateMetaTag('meta[property="og:title"]', pageTitle);
    updateMetaTag('meta[property="og:description"]', pageDescription);
    updateMetaTag('meta[name="twitter:title"]', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', pageDescription);

    return () => {
      document.title = originalTitle;
      updateMetaTag('meta[name="description"]', originalDescription);
      updateMetaTag('meta[property="og:title"]', originalOgTitle);
      updateMetaTag('meta[property="og:description"]', originalOgDesc);
      updateMetaTag('meta[name="twitter:title"]', originalTwitterTitle);
      updateMetaTag('meta[name="twitter:description"]', originalTwitterDesc);
    };
  }, [title, description]);

  // Generate Google Rich Snippets FAQ Schema
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

        {(features && features.length > 0) || (faq && faq.length > 0) ? (
          <>
            <button
              className="seo-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>{isExpanded ? 'Hide' : 'Read More About'} {title}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
              <>
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
              </>
            )}
          </>
        ) : null}
      </article>
    </div>
  );
}
