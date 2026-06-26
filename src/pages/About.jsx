import { Info } from 'lucide-react';
import './LegalPages.css';

export default function About() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <Info size={48} className="legal-icon" />
        <h1>About Us</h1>
      </div>

      <div className="legal-content">
        <section>
          <h2>Our Mission</h2>
          <p>
            JSON AI was built with a simple mission: to provide developers with the fastest, most reliable, 
            and most beautifully designed set of JSON utilities on the web.
          </p>
        </section>

        <section>
          <h2>Why We Built This</h2>
          <p>
            As developers, we found ourselves constantly searching for JSON formatters, validators, and diff tools. 
            However, many existing tools were either slow, cluttered with intrusive ads, or lacked modern features like dark mode. 
            More importantly, we were uncomfortable pasting sensitive production JSON data into websites that processed it on their servers.
          </p>
          <p>
            We built JSON AI to solve this. Our entire suite of tools is 100% client-side. This means your data never 
            leaves your browser. It's lightning-fast, highly secure, and works entirely in your local environment.
          </p>
          <p>
            — <strong>The JSON AI Team</strong>
          </p>
        </section>

        <section>
          <h2>Features We Love</h2>
          <ul>
            <li><strong>Client-Side Processing:</strong> Zero server latency and maximum data privacy.</li>
            <li><strong>AI Integration:</strong> The first JSON tool suite to natively integrate with Google Gemini and OpenAI for schema generation and AI analysis.</li>
            <li><strong>Modern Design:</strong> A beautiful, distraction-free interface with full dark mode support.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
