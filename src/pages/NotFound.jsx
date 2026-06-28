import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import RouteLink from '../components/RouteLink';

const NotFound = () => {
  // Set 404 status code for server-side rendering
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      // This helps search engines understand it's a 404
      const meta = document.querySelector('meta[property="http-equiv"]');
      if (meta) meta.remove();
    }
  }, []);

  return (
    <div className="not-found">
      <motion.div
        className="not-found-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="not-found-content">
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Page Not Found</h2>
          <p className="not-found-description">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <div className="not-found-actions">
            <RouteLink to="/" className="not-found-btn btn-primary">
              <Home size={18} />
              Go to Home
            </RouteLink>
            <button
              className="not-found-btn btn-secondary"
              onClick={() => window.history.back()}
              title="Go back to previous page"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        .not-found {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 112px);
          padding: 2rem;
          background: var(--bg-primary);
        }

        .not-found-container {
          max-width: 600px;
          text-align: center;
        }

        .not-found-content {
          padding: 2rem;
        }

        .not-found-code {
          font-size: 6rem;
          font-weight: 900;
          margin: 0;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .not-found-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 1rem 0;
        }

        .not-found-description {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 1.5rem 0 2rem;
          line-height: 1.6;
        }

        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .not-found-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .btn-primary {
          background: var(--accent-primary);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--bg-elevated, rgba(255, 255, 255, 0.06));
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-elevated, rgba(255, 255, 255, 0.1));
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .not-found-code {
            font-size: 4rem;
          }

          .not-found-title {
            font-size: 1.5rem;
          }

          .not-found-actions {
            flex-direction: column;
          }

          .not-found-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;