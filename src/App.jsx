import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Page components
import Home from './pages/Home'
import Formatter from './pages/Formatter'
import Validator from './pages/Validator'
import Converter from './pages/Converter'
import DiffTool from './pages/DiffTool'
import PathFinder from './pages/PathFinder'
import SchemaGenerator from './pages/SchemaGenerator'
import TreeEditor from './pages/TreeEditor'
import AiAssistant from './pages/AiAssistant'
import TypeGenerator from './pages/TypeGenerator'
import JsonMinifier from './pages/JsonMinifier'
import PromptBuilder from './pages/PromptBuilder'
import EscapeTool from './pages/EscapeTool'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import About from './pages/About'
import Contact from './pages/Contact'

function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 140px)' }}>
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
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  )
}

export default App
