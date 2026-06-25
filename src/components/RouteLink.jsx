import { Link, NavLink } from 'react-router-dom';

const RouteLink = ({
  to,
  activeClassName = 'active',
  className = '',
  children,
  ...props
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [className, isActive ? activeClassName : null].filter(Boolean).join(' ')
      }
      {...props}
    >
      {children}
    </NavLink>
  );
};

export default RouteLink;
