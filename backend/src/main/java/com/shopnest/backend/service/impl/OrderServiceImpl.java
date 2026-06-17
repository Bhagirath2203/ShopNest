package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.order.OrderRequest;
import com.shopnest.backend.dto.order.OrderResponse;
import com.shopnest.backend.dto.order.OrderStatusUpdateRequest;
import com.shopnest.backend.entity.*;
import com.shopnest.backend.exception.InsufficientStockException;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.AddressRepository;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.OrderRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.service.OrderService;
import com.shopnest.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Long userId = user.getId();

        // 1. Load cart and verify it's not empty
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for current user"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot place order with an empty cart");
        }

        // 2. Load and verify delivery address belongs to current user
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));

        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address", request.getAddressId());
        }

        // 3. Check stock for all items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        product.getName(), cartItem.getQuantity(), product.getStock());
            }
        }

        // 4. Create order and order items
        Order order = Order.builder()
                .user(user)
                .shippingAddress(address)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Create order item with price snapshot
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())  // Price snapshot at time of purchase!
                    .build();

            order.getItems().add(orderItem);

            // Calculate subtotal
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // 5. Reduce product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);

        // 6. Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order placed: id={}, userId={}, total={}", savedOrder.getId(), userId, totalAmount);

        // 7. Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderResponse.fromEntity(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Verify ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", id);
        }

        return OrderResponse.fromEntity(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Invalid order status: " + request.getStatus());
        }

        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                    "Cannot transition order from " + order.getStatus() + " to " + newStatus);
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        log.info("Order {} status updated: {} → {}", id, oldStatus, newStatus);

        return OrderResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Verify the order belongs to the current user
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", id);
        }

        // Only PENDING and CONFIRMED orders can be cancelled by the user
        if (!order.getStatus().canTransitionTo(OrderStatus.CANCELLED)) {
            throw new IllegalStateException(
                    "Cannot cancel order with status: " + order.getStatus());
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        log.info("Order {} cancelled by user {}: {} → CANCELLED", id, userId, oldStatus);

        return OrderResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable, String statusFilter) {
        Page<Order> page;

        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            OrderStatus status;
            try {
                status = OrderStatus.valueOf(statusFilter.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException("Invalid order status filter: " + statusFilter);
            }
            page = orderRepository.findByStatus(status, pageable);
        } else {
            page = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return page.map(OrderResponse::fromEntity);
    }
}
