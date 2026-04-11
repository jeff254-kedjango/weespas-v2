/* Animated heart button for favoriting properties */

import React, { useState } from 'react';
import Icon from './Icon';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ active, onToggle, className = '' }) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); /* Prevent card link navigation */
    e.stopPropagation();
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      type="button"
      className={`favorite-btn ${active ? 'favorite-btn--active' : ''} ${animating ? 'favorite-btn--pop' : ''} ${className}`}
      onClick={handleClick}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon name={active ? 'heartFilled' : 'heart'} size={20} />
    </button>
  );
};

export default FavoriteButton;
