import { useState } from 'react';
import { motion } from 'framer-motion';
import ToolCard from '../components/ToolCard';
import {
  Wand2, ShieldCheck, ArrowLeftRight, GitCompare,
  Search, FileJson, TreePine, Sparkles, Lock, Code2
} from 'lucide-react';
import './Home.css';

const tools = [
  {
    title: 'AI Assistant',
    description: 'AI-powered JSON generation, explanation, and schema suggestions.',
    icon: Sparkles,
    to: '/ai-assistant',
    color: '#8b5cf6',
  },
  {
    title: 'Type Generator',
    description: 'Instantly convert JSON into production-ready TypeScript, Zod, Python, Go, Rust, and PHP.',
    icon: Code2,
    to: '/type-generator',
    color: '#3b82f6',
  },
  {
    title: 'JSON Formatter',
    description: 'Format, beautify, and minify JSON with customizable indentation.',
    icon: Wand2,
    to: '/formatter',
    color: '#6366f1',
  },
  {
    title: 'JSON Validator',
    description: 'Validate JSON with detailed error messages and line-level feedback.',
    icon: ShieldCheck,
    to: '/validator',
    color: '#22c55e',
  },
  {
    title: 'JSON Converter',
    description: 'Convert between JSON, CSV, YAML, XML, and TOML formats.',
    icon: ArrowLeftRight,
    to: '/converter',
    color: '#06b6d4',
  },
  {
    title: 'JSON Diff',
    description: 'Compare two JSON documents with semantic diff highlighting.',
    icon: GitCompare,
    to: '/diff',
    color: '#f59e0b',
  },
  {
    title: 'Path Finder',
    description: 'Query JSON with JSONPath and interactively explore paths.',
    icon: Search,
    to: '/path-finder',
    color: '#a855f7',
  },
  {
    title: 'Schema Generator',
    description: 'Auto-generate JSON Schema and validate data against schemas.',
    icon: FileJson,
    to: '/schema',
    color: '#ec4899',
  },
  {
    title: 'Tree Editor',
    description: 'Visual tree editor with inline editing and code sync.',
    icon: TreePine,
    to: '/editor',
    color: '#14b8a6',
  },
  {
    title: 'Escape Tool',
    description: 'Escape and unescape JSON strings for safe embedding.',
    icon: Lock,
    to: '/escape',
    color: '#f59e0b',
  },
];

const features = [
  { emoji: '🔒', label: 'Privacy First' },
  { emoji: '⚡', label: 'Lightning Fast' },
  { emoji: '🤖', label: 'AI Powered' },
  { emoji: '💻', label: '100% Client-Side' },
];

const Home = () => {
  const [search, setSearch] = useState('');

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      {/* Background orbs */}
      <div className="home-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Hero */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-badge">✨ Free & Open Source</div>
        <h1 className="hero-title">
          Smart <span className="gradient-text">JSON AI</span>
        </h1>
        <p className="hero-subtitle">
          Format, validate, and explore JSON data instantly. Supercharge your workflow 
          with our secure, client-side AI Assistant.
        </p>

        {/* Search */}
        <div className="hero-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Feature badges */}
        <div className="features-bar">
          {features.map((f) => (
            <div key={f.label} className="feature-badge">
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Tools Grid */}
      <section className="tools-section">
        <div className="tools-grid">
          {filtered.map((tool, i) => (
            <motion.div
              key={tool.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <ToolCard {...tool} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              <p>No tools found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
