package com.shopnest.backend.service;

import com.shopnest.backend.entity.RefreshToken;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.RefreshTokenRepository;
import com.shopnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs; // 7 days default

    /**
     * Creates a new refresh token for the given user.
     */
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .used(false)
                .build();

        refreshToken = refreshTokenRepository.save(refreshToken);
        log.info("Created refresh token for user: {}", user.getEmail());
        return refreshToken;
    }

    /**
     * Verifies the refresh token and rotates it (old → used, new → created).
     * If the token was already used, it means theft — invalidate ALL tokens for the user.
     */
    @Transactional
    public RefreshToken verifyAndRotate(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Refresh token not found: {}", token.substring(0, 8) + "...");
                    return new ResourceNotFoundException("Refresh token not found");
                });

        // THEFT DETECTION: token already used → someone stole it
        if (refreshToken.getUsed()) {
            log.error("SECURITY: Refresh token reuse detected for user {}! Invalidating all tokens.",
                    refreshToken.getUser().getEmail());
            refreshTokenRepository.deleteAllByUserId(refreshToken.getUser().getId());
            throw new RuntimeException("Refresh token was already used. All sessions invalidated for security.");
        }

        // Check expiry
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            log.warn("Refresh token expired for user: {}", refreshToken.getUser().getEmail());
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        // Mark old token as used (rotation)
        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);

        // Create new token
        return createRefreshToken(refreshToken.getUser().getId());
    }

    /**
     * Invalidates all refresh tokens for a user (used on logout).
     */
    @Transactional
    public void invalidateAllUserTokens(Long userId) {
        refreshTokenRepository.deleteAllByUserId(userId);
        log.info("Invalidated all refresh tokens for user: {}", userId);
    }
}
