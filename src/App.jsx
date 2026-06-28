import { Suspense, lazy, useLayoutEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Page components
import Home from './pages/Home'
const Formatter = lazy(() => import('./pages/Formatter'))
const Validator = lazy(() => import('./pages/Validator'))
const Converter = lazy(() => import('./pages/Converter'))
const DiffTool = lazy(() => import('./pages/DiffTool'))
const PathFinder = lazy(() => import('./pages/PathFinder'))
const SchemaGenerator = lazy(() => import('./pages/SchemaGenerator'))
const TreeEditor = lazy(() => import('./pages/TreeEditor'))
const AiAssistant = lazy(() => import('./pages/AiAssistant'))
const TypeGenerator = lazy(() => import('./pages/TypeGenerator'))
const JsonMinifier = lazy(() => import('./pages/JsonMinifier'))
const PromptBuilder = lazy(() => import('./pages/PromptBuilder'))
const EscapeTool = lazy(() => import('./pages/EscapeTool'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 112px)', paddingTop: '56px' }}>
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/formatter" element={<Formatter />} />
            <Route path="/validator" element={<Validator />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/diff" element={<DiffTool />} />
            <Route path="/path-finder" element={<PathFinder />} />
            <Route path="/schema" element={<SchemaGenerator />} />
            <Route path="/schema-generator" element={<Navigate to="/schema" replace />} />
            <Route path="/editor" element={<TreeEditor />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/type-generator" element={<TypeGenerator />} />
            <Route path="/minifier" element={<JsonMinifier />} />
            <Route path="/prompt-builder" element={<PromptBuilder />} />
            <Route path="/escape" element={<EscapeTool />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

export default App
