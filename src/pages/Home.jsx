import { useState } from 'react';
import { motion } from 'framer-motion';
import ToolCard from '../components/ToolCard';
import { Search } from 'lucide-react';
import tools from '../data/tools';
import SeoContent from '../components/SeoContent';
import './Home.css';

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
        <div className="hero-badge">✨ Free Online AI-powered Tools</div>
        <h1 className="hero-title">
          AI-Powered <span className="gradient-text">JSON Developer Tools</span>
        </h1>
        <p className="hero-subtitle">
          Format, validate, and generate JSON instantly. Supercharge your workflow 
          with our secure, 100% client-side AI Assistant.
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
      <section className="tools-section" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="sr-only">Free browser-based JSON tools</h2>
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
		<SeoContent
        title="JSON AI - Free Online JSON Formatter, Validator & Beautifier"
        description={[
          "Welcome to JSON AI, your all-in-one suite of secure, client-side, and AI-powered JSON utilities. Our tools help web developers, data analysts, and engineering teams format, validate, convert, compare, minify, and query JSON payloads instantly and privately.",
          "Every tool in the JSON AI suite executes directly in your browser. We never upload or save your sensitive JSON configurations, database models, API keys, or custom payloads. It is 100% secure, private, and optimized for immediate client-side execution."
        ]}
        features={[
          { title: "JSON AI Assistant", desc: "Instantly draft JSON stubs, get schema feedback, or clarify complex objects in plain human English using Google Gemini and OpenAI models." },
          { title: "JSON Formatting & Minification", desc: "Format messy nested structures with custom tab spacing, or compress JSON data to save up to 75% tokens when building AI prompts." },
          { title: "Syntax Error Correction", desc: "Identify missing commas, unquoted keys, and nested brackets with real-time, line-by-line syntax highlighting and error guides." },
          { title: "Cross-Format Conversions", desc: "Convert standard JSON payloads into XML structures, clean YAML lists, TOML configs, or CSV spreadsheets for quick analysis." }
        ]}
        faq={[
          { q: "Is JSON AI completely free to use?", a: "Yes. All of our JSON formatting, validation, parsing, conversion, and exploration tools are completely free to use. There are no limits on payload size or conversion counts." },
          { q: "Are my API keys and payloads secure?", a: "Absolutely. Everything runs 100% client-side inside your browser environment. Your keys, schemas, and values never leave your device." },
          { q: "What is the JSON Prompt Builder?", a: "It is a specialized utility that rewrites verbose text-based prompts into highly structured JSON formats. This reduces token overhead significantly for systems like GPT-4 and Gemini." }
        ]}
      />
      </section>
    </div>
  );
};

export default Home;
