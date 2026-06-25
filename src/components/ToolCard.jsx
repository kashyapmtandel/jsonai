import RouteLink from './RouteLink';
import { ArrowRight } from 'lucide-react';
import './ToolCard.css';

const ToolCard = ({ title, description, icon: Icon, to, color = 'var(--accent-primary)' }) => {
  return (
    <RouteLink to={to} className="tool-card">
      <div
        className="tool-card-icon"
        style={{ backgroundColor: `${color}18`, color }}
      >
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-card-arrow">
        <ArrowRight size={18} />
      </span>
    </RouteLink>
  );
};

export default ToolCard;
