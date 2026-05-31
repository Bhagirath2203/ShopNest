package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.AuthResponse;
import com.shopnest.backend.dto.LoginRequest;
import com.shopnest.backend.dto.RegisterRequest;
import com.shopnest.backend.service.AuthService;
import com.shopnest.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, refresh, and logout endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authResponse));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity
                .ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Refresh token is required"));
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate all refresh tokens")
    public ResponseEntity<ApiResponse> logout() {
        Long userId = SecurityUtils.getCurrentUserId();
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
