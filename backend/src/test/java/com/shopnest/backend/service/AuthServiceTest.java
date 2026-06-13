package com.shopnest.backend.service;

import com.shopnest.backend.dto.AuthResponse;
import com.shopnest.backend.dto.LoginRequest;
import com.shopnest.backend.dto.RegisterRequest;
import com.shopnest.backend.entity.Cart;
import com.shopnest.backend.entity.RefreshToken;
import com.shopnest.backend.entity.Role;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.DuplicateResourceException;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.RoleRepository;
import com.shopnest.backend.repository.UserRepository;
import com.shopnest.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private CartRepository cartRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    // ── Helper methods ──

    private RegisterRequest buildRegisterRequest() {
        return RegisterRequest.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password123")
                .build();
    }

    private Role buildUserRole() {
        Role role = new Role();
        role.setId(1L);
        role.setName("ROLE_USER");
        return role;
    }

    private User buildUser(Role role) {
        return User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .build();
    }

    private RefreshToken buildRefreshToken(User user) {
        return RefreshToken.builder()
                .id(1L)
                .user(user)
                .token("refresh-token-value")
                .build();
    }

    // ── Tests ──

    @Test
    @DisplayName("register() — success: returns token and creates cart")
    void register_success_returnsTokenAndCreatesCart() {
        // Arrange
        RegisterRequest request = buildRegisterRequest();
        Role userRole = buildUserRole();
        User savedUser = buildUser(userRole);
        savedUser.getRoles().add(userRole);
        RefreshToken refreshToken = buildRefreshToken(savedUser);

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(cartRepository.save(any(Cart.class))).thenReturn(new Cart());
        when(jwtTokenProvider.generateTokenFromEmail("test@example.com")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken(any())).thenReturn(refreshToken);

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("refresh-token-value", response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getName());

        // Verify cart was created
        verify(cartRepository, times(1)).save(any(Cart.class));
        // Verify user was saved
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("register() — duplicate email: throws DuplicateResourceException")
    void register_duplicateEmail_throwsDuplicateResourceException() {
        // Arrange
        RegisterRequest request = buildRegisterRequest();
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(request)
        );

        assertTrue(exception.getMessage().contains("test@example.com"));

        // Verify no user was saved
        verify(userRepository, never()).save(any(User.class));
        // Verify no cart was created
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    @DisplayName("login() — wrong password: throws BadCredentialsException")
    void login_wrongPassword_throwsBadCredentialsException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("wrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        // Verify no refresh token was created
        verify(refreshTokenService, never()).createRefreshToken(any());
    }
}
