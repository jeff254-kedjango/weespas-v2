/* ==========================================================================
   NAVBAR — Sticky top navigation
   Transparent on hero, solid on scroll. Hides on mobile scroll-down.
   Links to login/register routes. Hamburger opens mobile drawer.
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  /* Scroll detection: solid bg after 60px, hide on scroll-down (mobile) */
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setScrolled(currentY > 60);

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

  const navClasses = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
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
            <Link to="/login" className="navbar__link">Login</Link>
            <Link to="/register" className="navbar__link navbar__link--cta">Sign Up</Link>
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
          <Link to="/login" className="drawer__link" onClick={() => setDrawerOpen(false)}>
            <Icon name="user" size={20} />
            <span>Login</span>
          </Link>
          <Link to="/register" className="drawer__link" onClick={() => setDrawerOpen(false)}>
            <Icon name="user" size={20} />
            <span>Sign Up</span>
          </Link>
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
