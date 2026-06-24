package com.shopnest.backend.service.impl;

import com.shopnest.backend.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Local filesystem implementation of FileStorageService.
 * Stores product images in the configured upload directory.
 *
 * In production, this could be swapped for an S3-backed implementation.
 */
@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    @Value("${app.upload.dir:uploads/products}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            log.info("Upload directory initialized: {}", uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    @Override
    public String storeProductImage(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed: JPEG, PNG, WebP, GIF"
            );
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored product image: {}", uniqueFilename);

            // Return the public URL path (served via resource handler)
            return "/uploads/products/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + uniqueFilename, e);
        }
    }

    @Override
    public void deleteProductImage(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            // Extract filename from URL path
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = uploadPath.resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted product image: {}", filename);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl, e);
        }
    }
}
