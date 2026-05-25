package com.shopnest.backend.util;

import com.shopnest.backend.entity.User;
import com.shopnest.backend.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class for accessing the currently authenticated user
 * from anywhere in the application (service layer, etc.)
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class — prevent instantiation
    }

    /**
     * Get the current authenticated user's ID.
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the current authenticated User entity.
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalStateException("No authenticated user found");
        }
        return ((CustomUserDetails) authentication.getPrincipal()).getUser();
    }

    /**
     * Get the current authenticated user's email.
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }
}
