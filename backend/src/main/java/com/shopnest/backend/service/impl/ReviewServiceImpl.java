package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.review.ProductRatingSummary;
import com.shopnest.backend.dto.review.ReviewRequest;
import com.shopnest.backend.dto.review.ReviewResponse;
import com.shopnest.backend.entity.Product;
import com.shopnest.backend.entity.Review;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.OrderRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.repository.ReviewRepository;
import com.shopnest.backend.service.ReviewService;
import com.shopnest.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(Long productId) {
        log.debug("Fetching reviews for product {}", productId);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductRatingSummary getRatingSummary(Long productId) {
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        long total = reviewRepository.countByProductId(productId);

        // Build per-star breakdown (initialize all stars to 0)
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            breakdown.put(i, 0L);
        }
        // Fill from DB group-by result
        List<Object[]> rows = reviewRepository.findRatingBreakdownByProductId(productId);
        for (Object[] row : rows) {
            Integer star = (Integer) row[0];
            Long count = (Long) row[1];
            breakdown.put(star, count);
        }

        return ProductRatingSummary.builder()
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(total)
                .ratingBreakdown(breakdown)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse addReview(Long productId, ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = SecurityUtils.getCurrentUser();

        // Check product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        // Check user hasn't already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new IllegalStateException("You have already reviewed this product");
        }

        // Check user has a DELIVERED order containing this product
        long deliveredCount = orderRepository.countDeliveredOrdersWithProduct(userId, productId);
        if (deliveredCount == 0) {
            throw new IllegalStateException("You can only review products you have purchased and received");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .build();

        review = reviewRepository.save(review);
        log.info("User {} added review for product {} — rating: {}", userId, productId, request.getRating());
        return ReviewResponse.fromEntity(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        // Only allow owner or admin to delete
        if (!review.getUser().getId().equals(currentUserId) && !isAdmin) {
            throw new IllegalStateException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
        log.info("Review {} deleted by user {}", reviewId, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReview(Long productId) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();

            // Already reviewed?
            if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
                return false;
            }

            // Has delivered order with this product?
            return orderRepository.countDeliveredOrdersWithProduct(userId, productId) > 0;
        } catch (IllegalStateException e) {
            // No authenticated user
            return false;
        }
    }
}
