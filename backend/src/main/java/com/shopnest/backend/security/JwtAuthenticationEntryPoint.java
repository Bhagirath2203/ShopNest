package com.shopnest.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopnest.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Returns 401 (not 403) when an unauthenticated user tries to access a protected endpoint.
 * Without this, Spring Security returns 403 by default for missing/invalid JWT.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse apiResponse = ApiResponse.error(
                "Unauthorized: " + authException.getMessage()
        );

        new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
    }
}
