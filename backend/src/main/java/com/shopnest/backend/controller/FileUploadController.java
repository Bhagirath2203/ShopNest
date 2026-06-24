package com.shopnest.backend.controller;

import com.shopnest.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST controller for file upload operations.
 * Only admins can upload product images.
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * Upload a product image.
     * Accepts multipart/form-data with a "file" field.
     * Returns the public URL of the stored image.
     */
    @PostMapping("/product-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.storeProductImage(file);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", Map.of("imageUrl", imageUrl),
                    "message", "Image uploaded successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}
