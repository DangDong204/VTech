package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.product.ProductVariantRequest;
import com.haui.vtech.dto.product.ProductVariantResponse;
import com.haui.vtech.service.ProductVariantService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;
    private final MessageUtil messageUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ProductVariantResponse> create(
            @RequestBody @Valid ProductVariantRequest request) {
        return ApiResponse.<ProductVariantResponse>builder()
                .data(variantService.create(request))
                .message(messageUtil.getMessage("product.variant.created.success", request.getSku()))
                .build();
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<ProductVariantResponse>> getByProductId(
            @PathVariable String productId) {
        return ApiResponse.<List<ProductVariantResponse>>builder()
                .data(variantService.getByProductId(productId))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductVariantResponse> getById(@PathVariable String id) {
        return ApiResponse.<ProductVariantResponse>builder()
                .data(variantService.getById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ProductVariantResponse> update(
            @PathVariable String id,
            @RequestBody @Valid ProductVariantRequest request) {
        return ApiResponse.<ProductVariantResponse>builder()
                .data(variantService.update(id, request))
                .message(messageUtil.getMessage("product.variant.updated.success", request.getSku()))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("product.variant.deleted.success", variantService.delete(id)))
                .build();
    }
}
