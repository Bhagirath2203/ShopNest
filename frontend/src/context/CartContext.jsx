import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart when user is authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0 });
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.getCart();
      const cartData = response.data.data;
      setCart(cartData);
      setCartCount(
        cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      );
    } catch {
      // Silently fail — user might not have a cart yet
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const response = await cartApi.addToCart(productId, quantity);
    await fetchCart(); // Refresh cart
    return response.data;
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const response = await cartApi.updateItem(itemId, quantity);
    await fetchCart();
    return response.data;
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    const response = await cartApi.removeItem(itemId);
    await fetchCart();
    return response.data;
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    const response = await cartApi.clearCart();
    setCart({ items: [], totalAmount: 0 });
    setCartCount(0);
    return response.data;
  }, []);

  const value = {
    cart,
    cartCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
