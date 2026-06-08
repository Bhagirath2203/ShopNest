package com.shopnest.backend.service;

import com.shopnest.backend.dto.review.ProductRatingSummary;
import com.shopnest.backend.dto.review.ReviewRequest;
import com.shopnest.backend.dto.review.ReviewResponse;

import java.util.List;

public interface ReviewService {

    List<ReviewResponse> getReviews(Long productId);

    ProductRatingSummary getRatingSummary(Long productId);

    ReviewResponse addReview(Long productId, ReviewRequest request);

    void deleteReview(Long reviewId);

    boolean canReview(Long productId);
}
