package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductImageResponse;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.dto.product.ProductUpdateRequest;
import com.haui.vtech.service.ProductImageService;
import com.haui.vtech.service.ProductService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(
            @Valid @ModelAttribute ProductCreationRequest request) {
        ProductResponse response = productService.create(request);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("product.created.success", response.getProductName()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts(){
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getAllProducts())
                .build();
    }

    @PostMapping("/{productId}/images")
    public ApiResponse<Void> uploadProductImages(
            @PathVariable String productId,
            @RequestParam(required = false) MultipartFile thumbnail,
            @RequestParam(required = false) List<MultipartFile> images) {
        productImageService.uploadProductImage(productId, thumbnail, images);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("product.images.upload.success"))
                .build();
    }

    @GetMapping("/{productId}/images")
    public ApiResponse<ProductImageResponse> getProductImages(@PathVariable String productId) {
        return ApiResponse.<ProductImageResponse>builder()
                .data(productImageService.getProductImages(productId))
                .build();
    }

    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String productId) {
        return ApiResponse.<ProductResponse>builder()
                .data(productService.getById(productId))
                .build();
    }

    @PutMapping("/{productId}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable String productId,
            @Valid @ModelAttribute ProductUpdateRequest request) {
        ProductResponse response = productService.update(productId, request);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("product.updated.success", response.getProductName()))
                .build();
    }

    @DeleteMapping("/trash/{productId}")
    public ApiResponse<Void> deleteProduct(@PathVariable String productId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("product.deleted.success", productService.delete(productId)))
                .build();
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> deleteSoftProduct(@PathVariable String productId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("product.deleted.soft.success", productService.deleteSoft(productId)))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<ProductResponse>> getAllInTrash() {
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getAllInTrash())
                .build();
    }

    @PatchMapping("trash/{productId}")
    public ApiResponse<Void> restoreProduct(@PathVariable String productId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("product.restored.success", productService.restore(productId)))
                .build();
    }

    @GetMapping("/tags/{tagId}")
    public ApiResponse<List<ProductResponse>> getProductsByTag(@PathVariable String tagId) {
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getProductsByTag(tagId))
                .build();
    }

    @GetMapping("/categories/{categoryId}")
    public ApiResponse<List<ProductResponse>> getProductsByCategory(@PathVariable String categoryId) {
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getProductsByCategory(categoryId))
                .build();
    }

    @GetMapping("/brands/{brandId}")
    public ApiResponse<List<ProductResponse>> getProductsByBrand(@PathVariable String brandId) {
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getProductsByBrand(brandId))
                .build();
    }

}
