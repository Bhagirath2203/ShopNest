package com.shopnest.backend.dto.order;

import com.shopnest.backend.dto.address.AddressResponse;
import com.shopnest.backend.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String status;
    private AddressResponse shippingAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse fromEntity(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .items(o.getItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .shippingAddress(o.getShippingAddress() != null
                        ? AddressResponse.fromEntity(o.getShippingAddress())
                        : null)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
