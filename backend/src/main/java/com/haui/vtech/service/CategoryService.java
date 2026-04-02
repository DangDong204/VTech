package com.haui.vtech.service;

import com.haui.vtech.dto.category.CategoryCreationRequest;
import com.haui.vtech.dto.category.CategoryResponse;
import com.haui.vtech.dto.category.CategoryUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryCreationRequest request, MultipartFile thumbnailUrl);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getById(String id);

    CategoryResponse update(String id, CategoryUpdateRequest request, MultipartFile thumbnailUrl);

    void  delete(String id);

    void deleteSoft(String id);

    List<CategoryResponse> getAllInTrash();

    void restore(String id);

}
