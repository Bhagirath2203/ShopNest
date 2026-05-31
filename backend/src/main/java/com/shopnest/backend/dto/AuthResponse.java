package com.shopnest.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private String refreshToken;
    private String email;
    private String name;
    private Set<String> roles;
}
