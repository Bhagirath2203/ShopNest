package com.shopnest.backend.service;

import com.shopnest.backend.dto.category.CategoryRequest;
import com.shopnest.backend.dto.category.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryRequest request);

    void deleteCategory(Long id);
}
