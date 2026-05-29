package com.shopnest.backend.service;

import com.shopnest.backend.dto.cart.CartItemRequest;
import com.shopnest.backend.dto.cart.CartResponse;

public interface CartService {

    CartResponse getCart();

    CartResponse addToCart(CartItemRequest request);

    CartResponse updateCartItem(Long itemId, Integer newQuantity);

    void removeCartItem(Long itemId);

    void clearCart();
}
