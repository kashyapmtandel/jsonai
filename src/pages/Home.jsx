import { useState } from 'react';
import { motion } from 'framer-motion';
import ToolCard from '../components/ToolCard';
import { Search } from 'lucide-react';
import tools from '../data/tools';
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
