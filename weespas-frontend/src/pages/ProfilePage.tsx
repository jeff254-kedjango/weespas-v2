import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import Icon from '../components/ui/Icon';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { favoriteCount } = useFavorites();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <Link to="/" className="profile-logo">weespas</Link>
            <h1>Your Profile</h1>
            <p>Sign in to view your profile, saved properties, and preferences.</p>
          </div>
          <div className="profile-auth-cta">
            <Link to="/login" className="profile-btn profile-btn--primary">
              Sign In
            </Link>
            <Link to="/register" className="profile-btn profile-btn--secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.created_at).toLocaleDateString('en-KE', {
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <Link to="/" className="profile-logo">weespas</Link>
          <h1>My Profile</h1>
        </div>

        {/* Avatar & Name */}
        <div className="profile-identity">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar__img" />
            ) : (
              <span className="profile-avatar__initials">{initials}</span>
            )}
          </div>
          <h2 className="profile-identity__name">{user.name}</h2>
          <p className="profile-identity__since">Member since {memberSince}</p>
        </div>

        {/* Contact Info */}
        <div className="profile-section">
          <h3 className="profile-section__title">Contact Information</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <Icon name="mail" size={18} />
              <div className="profile-info-item__content">
                <span className="profile-info-item__label">Email</span>
                <span className="profile-info-item__value">{user.email}</span>
              </div>
            </div>
            <div className="profile-info-item">
              <Icon name="phone" size={18} />
              <div className="profile-info-item__content">
                <span className="profile-info-item__label">Phone</span>
                <span className="profile-info-item__value">+254 {user.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-section">
          <h3 className="profile-section__title">Activity</h3>
          <div className="profile-stats">
            <Link to="/favorites" className="profile-stat-card">
              <div className="profile-stat-card__icon">
                <Icon name="heart" size={20} />
              </div>
              <span className="profile-stat-card__count">{favoriteCount}</span>
              <span className="profile-stat-card__label">Saved Properties</span>
            </Link>
            <div className="profile-stat-card">
              <div className="profile-stat-card__icon">
                <Icon name="search" size={20} />
              </div>
              <span className="profile-stat-card__count">--</span>
              <span className="profile-stat-card__label">Searches</span>
            </div>
          </div>
        </div>

        {/* Settings / Quick Links */}
        <div className="profile-section">
          <h3 className="profile-section__title">Settings</h3>
          <div className="profile-menu">
            <Link to="/favorites" className="profile-menu-item">
              <Icon name="heart" size={18} />
              <span>Saved Properties</span>
              <Icon name="chevronRight" size={16} />
            </Link>
            <button type="button" className="profile-menu-item" disabled>
              <Icon name="settings" size={18} />
              <span>Preferences</span>
              <span className="profile-menu-item__badge">Soon</span>
            </button>
            <button type="button" className="profile-menu-item" disabled>
              <Icon name="edit" size={18} />
              <span>Edit Profile</span>
              <span className="profile-menu-item__badge">Soon</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="profile-section profile-section--logout">
          {!showLogoutConfirm ? (
            <button
              type="button"
              className="profile-btn profile-btn--logout"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <Icon name="logout" size={18} />
              Sign Out
            </button>
          ) : (
            <div className="profile-logout-confirm">
              <p>Are you sure you want to sign out?</p>
              <div className="profile-logout-confirm__actions">
                <button
                  type="button"
                  className="profile-btn profile-btn--secondary"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn--danger"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
