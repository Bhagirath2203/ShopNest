package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.wishlist.WishlistResponse;
import com.shopnest.backend.entity.Product;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.entity.Wishlist;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.repository.WishlistRepository;
import com.shopnest.backend.service.WishlistService;
import com.shopnest.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Fetching wishlist for user {}", userId);
        return wishlistRepository.findByUserId(userId).stream()
                .map(WishlistResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public boolean toggleWishlist(Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            // Already wishlisted → remove
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            log.info("User {} removed product {} from wishlist", userId, productId);
            return false;
        } else {
            // Not wishlisted → add
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

            User user = SecurityUtils.getCurrentUser();

            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();

            wishlistRepository.save(wishlist);
            log.info("User {} added product {} to wishlist", userId, productId);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
