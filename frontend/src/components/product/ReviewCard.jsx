import { FiTrash2, FiThumbsUp } from 'react-icons/fi';
import StarRating from './StarRating';
import './ReviewCard.css';

/**
 * ReviewCard — displays a single review with star rating, reviewer name, title, body, date.
 * Props:
 *   review      — { id, rating, title, body, userName, userId, createdAt }
 *   currentUserId — the logged-in user's ID (to show delete button)
 *   onDelete    — callback to delete this review
 */
const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isOwner = currentUserId && currentUserId === review.userId;

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__rating">
          <StarRating rating={review.rating} size={15} />
        </div>
        <span className="review-card__date">{date}</span>
      </div>

      <h4 className="review-card__title">{review.title}</h4>
      <p className="review-card__body">{review.body}</p>

      <div className="review-card__footer">
        <div className="review-card__author">
          <span className="review-card__avatar">
            {review.userName?.charAt(0)?.toUpperCase() || '?'}
          </span>
          <span className="review-card__name">{review.userName}</span>
          <span className="review-card__badge">Verified Purchase</span>
        </div>

        <div className="review-card__actions">
          <button className="review-card__helpful" type="button">
            <FiThumbsUp size={14} />
            Helpful
          </button>

          {isOwner && (
            <button
              className="review-card__delete"
              type="button"
              onClick={() => onDelete && onDelete(review.id)}
              aria-label="Delete your review"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
