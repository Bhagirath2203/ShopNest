import api from './axiosInstance';

export const reviewApi = {
  getReviews: (productId) =>
    api.get(`/products/${productId}/reviews`),

  getRatingSummary: (productId) =>
    api.get(`/products/${productId}/reviews/summary`),

  canReview: (productId) =>
    api.get(`/products/${productId}/reviews/can-review`),

  addReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),

  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};
