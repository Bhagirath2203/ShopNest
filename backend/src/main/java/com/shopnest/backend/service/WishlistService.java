package com.shopnest.backend.service;

import com.shopnest.backend.dto.wishlist.WishlistResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistResponse> getWishlist();

    boolean toggleWishlist(Long productId);

    boolean isWishlisted(Long productId);
}
