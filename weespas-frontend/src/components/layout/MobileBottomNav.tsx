/* ==========================================================================
   MOBILE BOTTOM NAV — Fixed bottom tab bar (visible < 768px)
   4 tabs: Search, Map, Favorites, Profile. Electric Lime active indicator.
   ========================================================================== */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import './MobileBottomNav.css';

interface MobileBottomNavProps {
  favoriteCount?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ favoriteCount = 0 }) => {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { to: '/', icon: 'search' as const, label: 'Search' },
    { to: '/#map', icon: 'map' as const, label: 'Map' },
    { to: '/#favorites', icon: 'heart' as const, label: 'Saved', count: favoriteCount },
    { to: '/login', icon: 'user' as const, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const isActive = tab.to === '/' ? path === '/' : path.startsWith(tab.to);
        return (
          <Link
            key={tab.label}
            to={tab.to}
            className={`bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
          >
            <span className="bottom-nav__icon">
              <Icon name={tab.icon} size={22} />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bottom-nav__badge">{tab.count > 9 ? '9+' : tab.count}</span>
              )}
            </span>
            <span className="bottom-nav__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
