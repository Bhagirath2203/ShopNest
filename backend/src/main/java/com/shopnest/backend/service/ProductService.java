package com.shopnest.backend.service;

import com.shopnest.backend.dto.product.ProductPageResponse;
import com.shopnest.backend.dto.product.ProductRequest;
import com.shopnest.backend.dto.product.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    ProductPageResponse getProducts(Pageable pageable, Long categoryId, String search);

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
