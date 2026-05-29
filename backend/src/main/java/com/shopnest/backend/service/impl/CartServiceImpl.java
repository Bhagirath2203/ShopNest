package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.cart.CartItemRequest;
import com.shopnest.backend.dto.cart.CartResponse;
import com.shopnest.backend.entity.Cart;
import com.shopnest.backend.entity.CartItem;
import com.shopnest.backend.entity.Product;
import com.shopnest.backend.exception.InsufficientStockException;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.CartItemRepository;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.service.CartService;
import com.shopnest.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart() {
        Cart cart = getCartForCurrentUser();
        return CartResponse.fromEntity(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException(product.getName(), request.getQuantity(), product.getStock());
        }

        Cart cart = getCartForCurrentUser();

        // Check if product already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            // Increment quantity
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new InsufficientStockException(product.getName(), newQty, product.getStock());
            }
            item.setQuantity(newQty);
            log.debug("Updated cart item quantity for product '{}' to {}", product.getName(), newQty);
        } else {
            // Create new cart item
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            log.debug("Added product '{}' to cart (qty: {})", product.getName(), request.getQuantity());
        }

        Cart saved = cartRepository.save(cart);
        return CartResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long itemId, Integer newQuantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        // Verify ownership
        Cart cart = getCartForCurrentUser();
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", itemId);
        }

        if (newQuantity <= 0) {
            cart.getItems().remove(item);
            log.debug("Removed cart item {} (quantity set to 0)", itemId);
        } else {
            Product product = item.getProduct();
            if (product.getStock() < newQuantity) {
                throw new InsufficientStockException(product.getName(), newQuantity, product.getStock());
            }
            item.setQuantity(newQuantity);
            log.debug("Updated cart item {} quantity to {}", itemId, newQuantity);
        }

        Cart saved = cartRepository.save(cart);
        return CartResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void removeCartItem(Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        Cart cart = getCartForCurrentUser();
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", itemId);
        }

        cart.getItems().remove(item);
        cartRepository.save(cart);
        log.debug("Removed cart item {}", itemId);
    }

    @Override
    @Transactional
    public void clearCart() {
        Cart cart = getCartForCurrentUser();
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Cart cleared for user {}", SecurityUtils.getCurrentUserId());
    }

    private Cart getCartForCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for current user"));
    }
}
