import { Shield } from 'lucide-react';
import './LegalPages.css';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <Shield size={48} className="legal-icon" />
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to JSON Tools. We respect your privacy and are committed to protecting it. 
            Because of the technical architecture of our application, we collect absolutely no 
            personal data or JSON data that you process.
          </p>
        </section>

        <section>
          <h2>2. Local Processing (100% Client-Side)</h2>
          <p>
            <strong>All JSON processing happens entirely within your web browser.</strong>
          </p>
          <p>
            When you format, validate, convert, or otherwise manipulate JSON data using our tools, 
            that data never leaves your computer. We do not have servers that process your data, 
            and we cannot see, store, or access the information you paste into our application.
          </p>
        </section>

        <section>
          <h2>3. AI Assistant & API Keys</h2>
          <p>
            If you use our AI Assistant tool, you are required to provide your own API key (e.g., Google Gemini or OpenAI). 
            This API key is stored locally in your browser's <code>localStorage</code>. It is never sent to us. 
            When you submit a prompt, your browser communicates directly with the respective AI provider's API. 
            Please review the privacy policies of Google or OpenAI regarding how they handle data sent to their APIs.
          </p>
        </section>

        <section>
          <h2>4. Cookies and Analytics</h2>
          <p>
            We may use standard web analytics tools (like Google Analytics) to understand basic website traffic patterns 
            (e.g., which pages are most popular and what countries our users visit from). This involves the use of 
            standard cookies. These analytics do not capture the data you process in our tools.
          </p>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website 
            or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings.
          </p>
        </section>

        <section>
          <h2>5. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page 
            with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  );
}
