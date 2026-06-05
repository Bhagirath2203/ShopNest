import api from './axiosInstance';

export const wishlistApi = {
  getWishlist: () =>
    api.get('/wishlist'),

  toggleWishlist: (productId) =>
    api.post(`/wishlist/${productId}`),
};
