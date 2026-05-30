package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.admin.AdminStatsResponse;
import com.shopnest.backend.entity.OrderStatus;
import com.shopnest.backend.repository.OrderRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Admin dashboard endpoints")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse> getStats() {
        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.count())
                .totalUsers(userRepository.count())
                .totalRevenue(orderRepository.calculateTotalRevenue())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .confirmedOrders(orderRepository.countByStatus(OrderStatus.CONFIRMED))
                .shippedOrders(orderRepository.countByStatus(OrderStatus.SHIPPED))
                .deliveredOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .cancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED))
                .build();

        log.info("Admin stats retrieved: {} products, {} orders, {} users, revenue={}",
                stats.getTotalProducts(), stats.getTotalOrders(),
                stats.getTotalUsers(), stats.getTotalRevenue());

        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
    }
}
