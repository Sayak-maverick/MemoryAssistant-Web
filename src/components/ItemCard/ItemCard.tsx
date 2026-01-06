/**
 * ItemCard.tsx - Reusable card component to display a single item
 *
 * This is a React COMPONENT - a function that returns JSX.
 * Similar to ItemCard.kt in Android, but using React/JSX.
 *
 * Components are the building blocks of React apps.
 */

import React from 'react';
import { Item } from '../../types/item.types';
import './ItemCard.css';

/**
 * Props (Properties) - Data passed to the component
 *
 * In React, we use "props" to pass data to components.
 * Similar to function parameters in Kotlin.
 *
 * TypeScript interface ensures we pass the right data!
 */
interface ItemCardProps {
  item: Item;              // The item to display
  onClick?: () => void;    // Optional click handler (? means optional)
}

/**
 * ItemCard Component
 *
 * This is a FUNCTIONAL COMPONENT - just a function that returns JSX.
 *
 * @param props - The props object with item and onClick
 * @returns JSX element (looks like HTML, but it's JavaScript)
 */
const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  /**
   * Destructuring - Extract properties from the props object
   * { item, onClick } is shorthand for:
   * const item = props.item;
   * const onClick = props.onClick;
   */

  return (
    <div className="item-card" onClick={onClick}>
      {/* Icon/Emoji Circle */}
      <div className="item-card-icon">
        <span className="item-emoji">{getEmojiForItem(item.name)}</span>
      </div>

      {/* Content */}
      <div className="item-card-content">
        {/* Name */}
        <h3 className="item-card-name">{item.name}</h3>

        {/* Description (conditional rendering) */}
        {item.description && (
          <p className="item-card-description">{item.description}</p>
        )}

        {/* Timestamp */}
        <p className="item-card-timestamp">{formatTimestamp(item.createdAt)}</p>

        {/* Labels/Tags */}
        {item.labels.length > 0 && (
          <div className="item-card-labels">
            {item.labels.slice(0, 3).map((label, index) => (
              <span key={index} className="label-chip">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Helper function: Get emoji based on item name
 * Same logic as Android version!
 */
function getEmojiForItem(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('key')) return '🔑';
  if (lowerName.includes('wallet')) return '💼';
  if (lowerName.includes('phone')) return '📱';
  if (lowerName.includes('glass')) return '👓';
  if (lowerName.includes('watch')) return '⌚';
  if (lowerName.includes('bag')) return '🎒';
  if (lowerName.includes('book')) return '📚';
  if (lowerName.includes('headphone')) return '🎧';

  return '📦';  // Default box emoji
}

/**
 * Helper function: Format timestamp to readable string
 * Converts milliseconds to "2 hours ago" or "Jan 5, 2:30 PM"
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60000) return 'Just now';

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hours ago`;
  }

  // More than 1 day - show date and time
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Export the component so other files can use it
export default ItemCard;
