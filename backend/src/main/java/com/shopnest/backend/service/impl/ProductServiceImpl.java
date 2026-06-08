package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.product.ProductPageResponse;
import com.shopnest.backend.dto.product.ProductRequest;
import com.shopnest.backend.dto.product.ProductResponse;
import com.shopnest.backend.entity.Category;
import com.shopnest.backend.entity.Product;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.CategoryRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.repository.ReviewRepository;
import com.shopnest.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #categoryId + '-' + #search")
    public ProductPageResponse getProducts(Pageable pageable, Long categoryId, String search) {
        Page<Product> page;

        if (search != null && !search.trim().isEmpty()) {
            log.debug("Searching products with query: '{}'", search);
            page = productRepository.searchProducts(search.trim(), pageable);
        } else if (categoryId != null) {
            log.debug("Fetching products for category: {}", categoryId);
            page = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            log.debug("Fetching all products, page: {}", pageable.getPageNumber());
            page = productRepository.findByActiveTrue(pageable);
        }

        return ProductPageResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        Double avgRating = reviewRepository.findAverageRatingByProductId(id);
        long reviewCount = reviewRepository.countByProductId(id);
        return ProductResponse.fromEntity(product, avgRating, reviewCount);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created: {} (id={})", saved.getName(), saved.getId());
        return ProductResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        log.info("Product updated: {} (id={})", saved.getName(), saved.getId());
        return ProductResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productRepository.delete(product);
        log.info("Product deleted: {} (id={})", product.getName(), id);
    }
}
