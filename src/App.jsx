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
            <Route path="/json-formatter/" element={<Formatter />} />
            <Route path="/formatter/" element={<Navigate to="/json-formatter/" replace />} />
            
            <Route path="/json-validator/" element={<Validator />} />
            <Route path="/validator/" element={<Navigate to="/json-validator/" replace />} />
            
            <Route path="/json-converter/" element={<Converter />} />
            <Route path="/converter/" element={<Navigate to="/json-converter/" replace />} />
            
            <Route path="/json-diff/" element={<DiffTool />} />
            <Route path="/diff/" element={<Navigate to="/json-diff/" replace />} />
            
            <Route path="/json-path-finder/" element={<PathFinder />} />
            <Route path="/path-finder/" element={<Navigate to="/json-path-finder/" replace />} />
            
            <Route path="/json-schema/" element={<SchemaGenerator />} />
            <Route path="/schema/" element={<Navigate to="/json-schema/" replace />} />
            <Route path="/schema-generator" element={<Navigate to="/json-schema/" replace />} />
            
            <Route path="/json-editor/" element={<TreeEditor />} />
            <Route path="/editor/" element={<Navigate to="/json-editor/" replace />} />
            
            <Route path="/json-ai-assistant/" element={<AiAssistant />} />
            <Route path="/ai-assistant/" element={<Navigate to="/json-ai-assistant/" replace />} />
            
            <Route path="/json-type-generator/" element={<TypeGenerator />} />
            <Route path="/type-generator/" element={<Navigate to="/json-type-generator/" replace />} />
            
            <Route path="/json-minifier/" element={<JsonMinifier />} />
            <Route path="/minifier/" element={<Navigate to="/json-minifier/" replace />} />
            
            <Route path="/json-prompt-builder/" element={<PromptBuilder />} />
            <Route path="/prompt-builder/" element={<Navigate to="/json-prompt-builder/" replace />} />
            
            <Route path="/json-escape/" element={<EscapeTool />} />
            <Route path="/escape/" element={<Navigate to="/json-escape/" replace />} />
            <Route path="/privacy/" element={<PrivacyPolicy />} />
            <Route path="/terms/" element={<TermsOfService />} />
            <Route path="/about/" element={<About />} />
            <Route path="/contact/" element={<Contact />} />
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
