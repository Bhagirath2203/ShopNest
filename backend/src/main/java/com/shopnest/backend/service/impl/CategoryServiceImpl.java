package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.category.CategoryRequest;
import com.shopnest.backend.dto.category.CategoryResponse;
import com.shopnest.backend.entity.Category;
import com.shopnest.backend.exception.DuplicateResourceException;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.CategoryRepository;
import com.shopnest.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<CategoryResponse> getAllCategories() {
        log.debug("Fetching all categories from database");
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: {} (id={})", saved.getName(), saved.getId());
        return CategoryResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(category);
        log.info("Category deleted: {} (id={})", category.getName(), id);
    }
}
