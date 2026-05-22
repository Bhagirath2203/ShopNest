package com.shopnest.backend.entity;

/**
 * Represents the lifecycle stages of an order.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
