package com.shopnest.backend.dto.product;

import com.shopnest.backend.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private Boolean active;
    private LocalDateTime createdAt;

    // Review aggregate fields
    private Double averageRating;
    private Long totalReviews;

    public static ProductResponse fromEntity(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .build();
    }

    public static ProductResponse fromEntity(Product p, Double avgRating, Long reviewCount) {
        ProductResponse resp = fromEntity(p);
        resp.setAverageRating(avgRating);
        resp.setTotalReviews(reviewCount);
        return resp;
    }
}
