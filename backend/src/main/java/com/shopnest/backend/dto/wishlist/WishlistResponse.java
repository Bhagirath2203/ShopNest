package com.shopnest.backend.dto.wishlist;

import com.shopnest.backend.dto.product.ProductResponse;
import com.shopnest.backend.entity.Wishlist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {

    private Long id;
    private ProductResponse product;
    private LocalDateTime createdAt;

    public static WishlistResponse fromEntity(Wishlist w) {
        return WishlistResponse.builder()
                .id(w.getId())
                .product(ProductResponse.fromEntity(w.getProduct()))
                .createdAt(w.getCreatedAt())
                .build();
    }
}
