package com.shopnest.backend.service;

import com.shopnest.backend.dto.order.OrderRequest;
import com.shopnest.backend.dto.order.OrderResponse;
import com.shopnest.backend.dto.order.OrderStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(OrderRequest request);

    List<OrderResponse> getUserOrders();

    OrderResponse getOrderById(Long id);

    OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request);

    OrderResponse cancelOrder(Long id);

    Page<OrderResponse> getAllOrders(Pageable pageable, String statusFilter);
}
