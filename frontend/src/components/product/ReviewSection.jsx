import { useState, useEffect, useCallback } from 'react';
import { FiEdit3, FiStar } from 'react-icons/fi';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import './ReviewSection.css';

/**
 * ReviewSection — rating summary + breakdown bars + review list + write form.
 * Props:
 *   productId — the product being viewed
 */
const ReviewSection = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsRes, summaryRes] = await Promise.all([
        reviewApi.getReviews(productId),
        reviewApi.getRatingSummary(productId),
      ]);
      setReviews(reviewsRes.data.data || []);
      setSummary(summaryRes.data.data || null);

      // Check if user can review (only if authenticated)
      if (isAuthenticated) {
        try {
          const canRes = await reviewApi.canReview(productId);
          setCanReview(canRes.data.data);
        } catch {
          setCanReview(false);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formRating === 0) {
      toast.warning('Please select a rating');
      return;
    }
    try {
      setSubmitting(true);
      await reviewApi.addReview(productId, {
        rating: formRating,
        title: formTitle,
        body: formBody,
      });
      toast.success('Review submitted!');
      setShowForm(false);
      setFormRating(0);
      setFormTitle('');
      setFormBody('');
      // Refresh reviews
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    try {
      await reviewApi.deleteReview(productId, reviewId);
      toast.success('Review deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  // Check if current user has already reviewed
  const userReview = reviews.find((r) => user && r.userId === user.id);

  if (loading) {
    return (
      <div className="review-section">
        <div className="review-section__skeleton">
          <div className="skeleton" style={{ width: '200px', height: '24px' }} />
          <div className="skeleton" style={{ width: '100%', height: '80px', marginTop: '1rem' }} />
          <div className="skeleton" style={{ width: '100%', height: '120px', marginTop: '1rem' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <h2 className="review-section__title">
        <FiStar /> Ratings & Reviews
      </h2>

      {/* ── Rating Summary ── */}
      {summary && (
        <div className="review-section__summary">
          <div className="review-section__avg">
            <span className="review-section__avg-number">
              {summary.averageRating?.toFixed(1) || '0.0'}
            </span>
            <StarRating rating={summary.averageRating || 0} size={20} />
            <span className="review-section__avg-count">
              {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Breakdown bars */}
          {summary.totalReviews > 0 && (
            <div className="review-section__breakdown">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.ratingBreakdown?.[star] || 0;
                const pct = summary.totalReviews > 0
                  ? Math.round((count / summary.totalReviews) * 100)
                  : 0;
                return (
                  <div key={star} className="review-section__bar-row">
                    <span className="review-section__bar-label">{star}★</span>
                    <div className="review-section__bar-track">
                      <div
                        className="review-section__bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="review-section__bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Write a Review Button ── */}
      <div className="review-section__actions">
        {!isAuthenticated && (
          <p className="review-section__login-hint">
            Log in to write a review
          </p>
        )}
        {isAuthenticated && userReview && (
          <p className="review-section__already">
            ✅ You've already reviewed this product
          </p>
        )}
        {isAuthenticated && canReview && !userReview && !showForm && (
          <button
            className="btn btn-primary review-section__write-btn"
            onClick={() => setShowForm(true)}
          >
            <FiEdit3 /> Write a Review
          </button>
        )}
      </div>

      {/* ── Review Form ── */}
      {showForm && (
        <form className="review-section__form" onSubmit={handleSubmit}>
          <h3 className="review-section__form-title">Write Your Review</h3>

          <div className="review-section__form-rating">
            <label>Your Rating</label>
            <StarRating
              rating={formRating}
              interactive
              onRate={setFormRating}
              size={28}
            />
            {formRating > 0 && (
              <span className="review-section__form-rating-text">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][formRating]}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Summarize your experience"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review</label>
            <textarea
              className="form-input review-section__textarea"
              placeholder="Tell others about your experience with this product..."
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="review-section__form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || formRating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Review List ── */}
      {reviews.length > 0 ? (
        <div className="review-section__list">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="review-section__empty">
          <FiStar size={32} />
          <p>No reviews yet</p>
          <span>Be the first to share your experience!</span>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
