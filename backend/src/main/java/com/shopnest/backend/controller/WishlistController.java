package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.wishlist.WishlistResponse;
import com.shopnest.backend.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Wishlist management")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get current user's wishlist")
    public ResponseEntity<ApiResponse> getWishlist() {
        List<WishlistResponse> wishlist = wishlistService.getWishlist();
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully", wishlist));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Toggle product in wishlist (add if absent, remove if present)")
    public ResponseEntity<ApiResponse> toggleWishlist(@PathVariable Long productId) {
        boolean added = wishlistService.toggleWishlist(productId);
        String message = added ? "Added to wishlist" : "Removed from wishlist";
        return ResponseEntity.ok(ApiResponse.success(message, added));
    }
}
