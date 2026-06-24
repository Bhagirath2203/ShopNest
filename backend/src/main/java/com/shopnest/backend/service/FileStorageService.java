package com.shopnest.backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Handles file storage operations for product images.
 */
public interface FileStorageService {

    /**
     * Store an uploaded image file and return its public URL path.
     *
     * @param file the uploaded file
     * @return the relative URL path to access the stored file (e.g., "/uploads/products/abc123.jpg")
     */
    String storeProductImage(MultipartFile file);

    /**
     * Delete a previously stored product image.
     *
     * @param fileUrl the relative URL path of the file
     */
    void deleteProductImage(String fileUrl);
}
