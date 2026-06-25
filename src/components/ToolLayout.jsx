import { motion } from 'framer-motion';
import './ToolLayout.css';

const ToolLayout = ({ title, description, icon: Icon, children }) => {
  return (
    <motion.div
      className="tool-layout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="tool-header">
        <h1>
          {Icon && <Icon size={28} />}
          {title}
        </h1>
        {description && <p>{description}</p>}
      </header>
      <div className="tool-content">{children}</div>
    </motion.div>
  );
};

export default ToolLayout;
