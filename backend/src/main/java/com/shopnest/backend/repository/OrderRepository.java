package com.shopnest.backend.repository;

import com.shopnest.backend.entity.Order;
import com.shopnest.backend.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.shopnest.backend.entity.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND o.status = com.shopnest.backend.entity.OrderStatus.DELIVERED")
    long countDeliveredOrdersWithProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
