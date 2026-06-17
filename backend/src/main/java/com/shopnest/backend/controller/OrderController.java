package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.order.OrderRequest;
import com.shopnest.backend.dto.order.OrderResponse;
import com.shopnest.backend.dto.order.OrderStatusUpdateRequest;
import com.shopnest.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @Operation(summary = "Place an order from cart items")
    public ResponseEntity<ApiResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse order = orderService.placeOrder(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<ApiResponse> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (Admin only)")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order (user can only cancel their own PENDING/CONFIRMED orders)")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long id) {
        OrderResponse order = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders with optional status filter (Admin only)")
    public ResponseEntity<ApiResponse> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getAllOrders(pageable, status);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }
}
