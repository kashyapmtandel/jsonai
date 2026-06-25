import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './SeoContent.css';

export default function SeoContent({ title, description, features, faq }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      {/* Invisible Schema Markup for Google Bots */}
      {faqSchema && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} 
        />
      )}

      <button 
        className="seo-expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{isExpanded ? 'Hide' : 'Read More About'} {title}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
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
      )}
    </div>
  );
}
