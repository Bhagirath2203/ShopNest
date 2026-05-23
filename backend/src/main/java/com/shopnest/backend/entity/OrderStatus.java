package com.shopnest.backend.entity;

/**
 * Represents the lifecycle stages of an order.
 * Transitions are validated — e.g., DELIVERED cannot go back to PENDING.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Validates whether a transition from this status to the given next status is allowed.
     *
     * Valid transitions:
     *   PENDING   → CONFIRMED, CANCELLED
     *   CONFIRMED → SHIPPED, CANCELLED
     *   SHIPPED   → DELIVERED
     *   DELIVERED → (terminal — no transitions allowed)
     *   CANCELLED → (terminal — no transitions allowed)
     */
    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case PENDING -> next == CONFIRMED || next == CANCELLED;
            case CONFIRMED -> next == SHIPPED || next == CANCELLED;
            case SHIPPED -> next == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}
