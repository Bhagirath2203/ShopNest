package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.review.ProductRatingSummary;
import com.shopnest.backend.dto.review.ReviewRequest;
import com.shopnest.backend.dto.review.ReviewResponse;
import com.shopnest.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews for a product")
    public ResponseEntity<ApiResponse> getReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getReviews(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get rating summary for a product")
    public ResponseEntity<ApiResponse> getRatingSummary(@PathVariable Long productId) {
        ProductRatingSummary summary = reviewService.getRatingSummary(productId);
        return ResponseEntity.ok(ApiResponse.success("Rating summary fetched successfully", summary));
    }

    @GetMapping("/can-review")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if current user can review this product")
    public ResponseEntity<ApiResponse> canReview(@PathVariable Long productId) {
        boolean canReview = reviewService.canReview(productId);
        return ResponseEntity.ok(ApiResponse.success("Eligibility checked", canReview));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a review for a product (verified purchase only)")
    public ResponseEntity<ApiResponse> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.addReview(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review added successfully", review));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a review (owner or admin)")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
