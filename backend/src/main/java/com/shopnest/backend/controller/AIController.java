package com.shopnest.backend.controller;

import com.shopnest.backend.dto.ApiResponse;
import com.shopnest.backend.dto.ai.AIDescriptionRequest;
import com.shopnest.backend.dto.ai.AIDescriptionResponse;
import com.shopnest.backend.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered product tools")
public class AIController {

    private final AIService aiService;

    @PostMapping("/generate-description")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate AI product description (Admin only)")
    public ResponseEntity<ApiResponse> generateDescription(
            @Valid @RequestBody AIDescriptionRequest request) {
        String description = aiService.generateDescription(request.getProductName());

        AIDescriptionResponse response = AIDescriptionResponse.builder()
                .productName(request.getProductName())
                .description(description)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Description generated", response));
    }
}
