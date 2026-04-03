package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.category.CategoryCreationRequest;
import com.haui.vtech.dto.category.CategoryResponse;
import com.haui.vtech.dto.category.CategoryTreeResponse;
import com.haui.vtech.dto.category.CategoryUpdateRequest;
import com.haui.vtech.service.CategoryService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(
            @Valid @ModelAttribute CategoryCreationRequest request,
            @RequestPart(required = false) MultipartFile thumbnailUrl
    ) {
        CategoryResponse response = categoryService.create(request, thumbnailUrl);
        return ApiResponse.<CategoryResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("category.created.success", response.getCategoryName()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getAllCategories())
                .build();
    }

    @GetMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> getById(@PathVariable String categoryId) {
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryService.getById(categoryId))
                .build();
    }

    @PutMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable String categoryId,
            @Valid @ModelAttribute CategoryUpdateRequest request,
            @RequestPart(required = false) MultipartFile thumbnailUrl
    ) {
        CategoryResponse response = categoryService.update(categoryId, request, thumbnailUrl);
        return ApiResponse.<CategoryResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("category.updated.success", response.getCategoryName()))
                .build();
    }

    @DeleteMapping("/trash/{categoryId}")
    public ApiResponse<Void> deleteCategory(@PathVariable String categoryId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage(
                        "category.deleted.success",
                        categoryService.delete(categoryId)))
                .build();
    }

    @DeleteMapping("/{categoryId}")
    public ApiResponse<Void> deleteSoftCategory(@PathVariable String categoryId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage(
                        "category.deleted.soft.success",
                        categoryService.deleteSoft(categoryId)))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<CategoryResponse>> getAllInTrash() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{categoryId}")
    public ApiResponse<Void> restoreCategory(@PathVariable String categoryId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage(
                        "category.restored.success",
                        categoryService.restore(categoryId)))
                .build();
    }

    // TODO: Frontend chưa gọi API này - update sau khi có giao diện client
    @GetMapping("/tree")
    public ApiResponse<List<CategoryTreeResponse>> getTree() {
        return ApiResponse.<List<CategoryTreeResponse>>builder()
                .data(categoryService.getCategoryTree())
                .build();
    }
}
