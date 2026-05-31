package com.shopnest.backend.service;

import com.shopnest.backend.dto.AuthResponse;
import com.shopnest.backend.dto.LoginRequest;
import com.shopnest.backend.dto.RegisterRequest;
import com.shopnest.backend.entity.Cart;
import com.shopnest.backend.entity.RefreshToken;
import com.shopnest.backend.entity.Role;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.DuplicateResourceException;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.RoleRepository;
import com.shopnest.backend.repository.UserRepository;
import com.shopnest.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * Register a new user with ROLE_USER, encode the password,
     * create a refresh token, and return JWT + refresh token.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        // Fetch the default role
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default role ROLE_USER not found. Has DataSeeder run?"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        // Build and save the user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // Create an empty cart for the new user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);
        log.info("Created empty cart for user: {}", user.getEmail());

        // Generate access token
        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .name(user.getName())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Authenticate a user with email + password,
     * create a refresh token, and return JWT + refresh token.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found after login"));

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .name(user.getName())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Refresh the access token using a valid refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken newRefreshToken = refreshTokenService.verifyAndRotate(refreshTokenStr);

        User user = newRefreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        log.info("Token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .email(user.getEmail())
                .name(user.getName())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Logout: invalidate all refresh tokens for the current user.
     */
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.invalidateAllUserTokens(userId);
        log.info("User logged out, all refresh tokens invalidated for userId: {}", userId);
    }
}
