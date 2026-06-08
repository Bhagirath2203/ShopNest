package com.shopnest.backend.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRatingSummary {

    private Double averageRating;
    private long totalReviews;
    private Map<Integer, Long> ratingBreakdown; // star (1-5) → count
}
