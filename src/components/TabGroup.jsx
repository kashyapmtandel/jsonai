import './TabGroup.css';

const TabGroup = ({
  items,
  activeId,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  return (
    <div className={`tab-group tab-group--${variant} ${className}`.trim()} role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            className={`tab-button ${isActive ? 'active' : ''}`.trim()}
            aria-pressed={isActive}
            onClick={() => onChange(item.id)}
          >
            {item.icon ? <item.icon size={16} /> : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabGroup;
