import { Suspense, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function Layout() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 112px)', paddingTop: '56px' }}>
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
