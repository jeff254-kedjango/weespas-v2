/* ==========================================================================
   NAVBAR — Sticky top navigation
   Always solid white background. Hides on mobile scroll-down.
   Links to login/register routes. Hamburger opens mobile drawer.
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  /* Hide navbar on mobile scroll-down */
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;

    if (window.innerWidth < 768) {
      setHidden(currentY > lastScrollY && currentY > 120);
    } else {
      setHidden(false);
    }
    setLastScrollY(currentY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* Close drawer on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* Smooth-scroll to an element by ID, navigating home first if needed */
  const scrollToSection = useCallback((id: string) => {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const offset = 20; // small breathing room above target
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    if (isHome) {
      doScroll();
    } else {
      navigate('/');
      // Wait for the home page to render, then scroll
      setTimeout(doScroll, 100);
    }
  }, [isHome, navigate]);

  const navClasses = [
    'navbar',
    hidden ? 'navbar--hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <nav className={navClasses}>
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            weespas
          </Link>

          {/* Desktop nav links */}
          <div className="navbar__links">
            <Link to="/" className="navbar__link">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="navbar__link">Favorites</Link>
                <button type="button" className="navbar__link navbar__link--btn" onClick={() => scrollToSection('after-hero')}>Properties</button>
                <button type="button" className="navbar__link navbar__link--btn" onClick={() => scrollToSection('contact-form')}>Contact Us</button>
                <Link to="/profile" className="navbar__link navbar__link--cta">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__link">Login</Link>
                <button type="button" className="navbar__link navbar__link--btn" onClick={() => scrollToSection('after-hero')}>Properties</button>
                <button type="button" className="navbar__link navbar__link--btn" onClick={() => scrollToSection('contact-form')}>Contact Us</button>
                <Link to="/register" className="navbar__link navbar__link--cta">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="navbar__hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile Drawer Panel */}
      <aside className={`drawer ${drawerOpen ? 'drawer--open' : ''}`} role="dialog" aria-modal="true">
        <div className="drawer__header">
          <span className="drawer__title">Menu</span>
          <button
            type="button"
            className="drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        <nav className="drawer__nav">
          <Link to="/" className="drawer__link" onClick={() => setDrawerOpen(false)}>
            <Icon name="search" size={20} />
            <span>Explore</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="drawer__link" onClick={() => setDrawerOpen(false)}>
                <Icon name="heart" size={20} />
                <span>Favorites</span>
              </Link>
              <button type="button" className="drawer__link" onClick={() => { setDrawerOpen(false); scrollToSection('after-hero'); }}>
                <Icon name="search" size={20} />
                <span>Properties</span>
              </button>
              <button type="button" className="drawer__link" onClick={() => { setDrawerOpen(false); scrollToSection('contact-form'); }}>
                <Icon name="mapPin" size={20} />
                <span>Contact Us</span>
              </button>
              <Link to="/profile" className="drawer__link" onClick={() => setDrawerOpen(false)}>
                <Icon name="user" size={20} />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="drawer__link" onClick={() => setDrawerOpen(false)}>
                <Icon name="user" size={20} />
                <span>Login</span>
              </Link>
              <button type="button" className="drawer__link" onClick={() => { setDrawerOpen(false); scrollToSection('after-hero'); }}>
                <Icon name="search" size={20} />
                <span>Properties</span>
              </button>
              <button type="button" className="drawer__link" onClick={() => { setDrawerOpen(false); scrollToSection('contact-form'); }}>
                <Icon name="mapPin" size={20} />
                <span>Contact Us</span>
              </button>
              <Link to="/register" className="drawer__link" onClick={() => setDrawerOpen(false)}>
                <Icon name="user" size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </nav>

        <div className="drawer__footer">
          <p>+254 713 083 378</p>
          <p>hello@weespas.com</p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
