package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.category.ClientCategoryResponse;
import com.haui.vtech.enums.CategoryStatus;
import com.haui.vtech.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/categories")
@RequiredArgsConstructor
public class ClientCategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ApiResponse<List<ClientCategoryResponse>> getClientCategories() {
        List<ClientCategoryResponse> categories = categoryRepository
                .findByStatusOrderByDisplayOrderAsc(CategoryStatus.ACTIVE)
                .stream()
                .map(c -> ClientCategoryResponse.builder()
                        .id(c.getId())
                        .categoryName(c.getCategoryName())
                        .slug(c.getSlug())
                        .thumbnailUrl(c.getThumbnailUrl())
                        .build())
                .toList();

        return ApiResponse.<List<ClientCategoryResponse>>builder()
                .data(categories)
                .message("Lấy danh mục thành công")
                .build();
    }
}