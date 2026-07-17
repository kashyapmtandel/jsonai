import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Distinguish between the raw index.html SEO fallback and actual React-prerendered HTML
const hasSeoFallback = rootElement.querySelector('.app-shell-fallback');
const isReactSnap = navigator.userAgent.includes('ReactSnap');
const isPrerenderedByReact = rootElement.hasChildNodes() && !hasSeoFallback && !isReactSnap;

if (isPrerenderedByReact) {
  hydrateRoot(rootElement, app);
} else {
  // Wipe the fallback SEO content (or previous route HTML during crawling) before mounting
  if (rootElement.hasChildNodes()) {
    rootElement.innerHTML = '';
  }
  createRoot(rootElement).render(app);
}
