import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import './StarRating.css';

/**
 * StarRating — displays 5 stars, supports display and interactive modes.
 * Props:
 *   rating (number)     — current rating to display (0-5, supports decimals)
 *   interactive (bool)  — if true, stars are clickable for input
 *   onRate (fn)         — callback when star is clicked (interactive mode)
 *   size (number)       — icon size in px (default 18)
 */
const StarRating = ({ rating = 0, interactive = false, onRate, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <span className={`star-rating${interactive ? ' star-rating--interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(displayRating);
        return (
          <button
            key={star}
            type="button"
            className={`star-rating__star${isFilled ? ' star-rating__star--filled' : ''}`}
            style={{ fontSize: `${size}px` }}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <FiStar
              style={{
                fill: isFilled ? '#f59e0b' : 'none',
                color: isFilled ? '#f59e0b' : '#d1d5db',
                transition: 'all 150ms ease',
              }}
            />
          </button>
        );
      })}
    </span>
  );
};

export default StarRating;
