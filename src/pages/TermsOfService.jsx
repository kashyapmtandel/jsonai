import { FileText } from 'lucide-react';
import './LegalPages.css';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <FileText size={48} className="legal-icon" />
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using JSON AI, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. Use of Service</h2>
          <p>
            JSON AI provides a suite of client-side web utilities for developers. The service is provided "as is" and 
            is completely free to use for personal and commercial purposes.
          </p>
          <ul>
            <li>You may not attempt to reverse engineer or disrupt the website's functionality.</li>
            <li>You may not use the AI features for any unlawful or abusive activities.</li>
          </ul>
        </section>

        <section>
          <h2>3. Disclaimer of Warranties</h2>
          <p>
            Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. 
            We do not warrant that the tools will be completely error-free or that they will meet your specific requirements.
          </p>
          <p>
            Always verify the output of our tools, especially the AI-generated content, before using it in production environments.
          </p>
        </section>

        <section>
          <h2>4. Limitation of Liability</h2>
          <p>
            In no event shall JSON AI or its creators be liable for any direct, indirect, incidental, special, or consequential 
            damages resulting from the use or inability to use the service, including but not limited to reliance on information 
            obtained from the service, mistakes, omissions, interruptions, or errors.
          </p>
        </section>

        <section>
          <h2>5. API Keys</h2>
          <p>
            If you provide third-party API keys (e.g., OpenAI, Google) to use certain features, you are solely responsible for 
            any charges, usage, or security breaches associated with those keys. We do not store these keys on our servers.
          </p>
        </section>
      </div>
    </div>
  );
}
