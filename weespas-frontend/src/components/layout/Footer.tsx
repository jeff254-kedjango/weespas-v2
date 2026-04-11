/* ==========================================================================
   FOOTER — Clean 3-column layout
   Simplified: no animated gradients, no geometric SVGs, no IntersectionObserver.
   ========================================================================== */

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          {/* Brand column */}
          <div className="footer__col">
            <h3 className="footer__logo">weespas</h3>
            <p className="footer__tagline">
              Discover premium properties with ease. Your gateway to exceptional
              real estate experiences across Kenya.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-7H8.9v-2.88h1.53V9.8c0-1.51.9-2.34 2.28-2.34.66 0 1.35.12 1.35.12v1.48h-.76c-.75 0-.98.47-.98.95v1.14h1.67l-.27 2.88h-1.4V21.9C18.34 21.13 22 16.99 22 12z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="X (Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <nav className="footer__nav">
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/" className="footer__link">Properties</Link>
              <Link to="/login" className="footer__link">Login</Link>
              <Link to="/register" className="footer__link">Sign Up</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact</h4>
            <nav className="footer__nav">
              <a href="tel:+254713083378" className="footer__link">+254 713 083 378</a>
              <a href="mailto:hello@weespas.com" className="footer__link">hello@weespas.com</a>
              <span className="footer__link">Nairobi, Kenya</span>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Weespas. All rights reserved.</p>
          <button type="button" className="footer__top-btn" onClick={scrollToTop}>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
