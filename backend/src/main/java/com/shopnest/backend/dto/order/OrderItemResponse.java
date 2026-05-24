package com.shopnest.backend.dto.order;

import com.shopnest.backend.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;

    public static OrderItemResponse fromEntity(OrderItem oi) {
        return OrderItemResponse.builder()
                .id(oi.getId())
                .productId(oi.getProduct().getId())
                .productName(oi.getProduct().getName())
                .productImageUrl(oi.getProduct().getImageUrl())
                .quantity(oi.getQuantity())
                .price(oi.getPrice())
                .subtotal(oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .build();
    }
}
