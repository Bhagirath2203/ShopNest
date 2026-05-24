package com.shopnest.backend.dto.cart;

import com.shopnest.backend.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;

    public static CartItemResponse fromEntity(CartItem ci) {
        BigDecimal price = ci.getProduct().getPrice();
        return CartItemResponse.builder()
                .id(ci.getId())
                .productId(ci.getProduct().getId())
                .productName(ci.getProduct().getName())
                .productImageUrl(ci.getProduct().getImageUrl())
                .price(price)
                .quantity(ci.getQuantity())
                .subtotal(price.multiply(BigDecimal.valueOf(ci.getQuantity())))
                .build();
    }
}
