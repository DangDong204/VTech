package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.brand.BrandUpdateRequest;
import com.haui.vtech.service.BrandService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;
    private final MessageUtil messageUtil;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BrandResponse> createBrand(
            @Valid @ModelAttribute BrandCreationRequest request,
            @RequestPart(required = false) MultipartFile brandLogo
    ) {
        BrandResponse response = brandService.create(request, brandLogo);
        return ApiResponse.<BrandResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("brand.created.success", response.getBrandName()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<BrandResponse>> getAll() {
        return ApiResponse.<List<BrandResponse>>builder()
                .data(brandService.getAllBrands())
                .build();
    }

    @GetMapping("/{brandId}")
    public ApiResponse<BrandResponse> getById(@PathVariable String brandId) {
        return ApiResponse.<BrandResponse>builder()
                .data(brandService.getById(brandId))
                .build();
    }

    @PutMapping("/{brandId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BrandResponse> updateBrand(
            @PathVariable String brandId,
            @Valid @ModelAttribute BrandUpdateRequest request,
            @RequestPart(required = false) MultipartFile brandLogo
    ) {
        BrandResponse response = brandService.update(brandId, request, brandLogo);
        return ApiResponse.<BrandResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("brand.updated.success", response.getBrandName()))
                .build();
    }

    @DeleteMapping("/trash/{brandId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteBrand(@PathVariable String brandId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("brand.deleted.success", brandService.delete(brandId)))
                .build();
    }

    @DeleteMapping("/{brandId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSoftBrand(@PathVariable String brandId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("brand.deleted.soft.success", brandService.deleteSoft(brandId)))
                .build();
    }

    @GetMapping("/trash")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BrandResponse>> getAllInTrash() {
        return ApiResponse.<List<BrandResponse>>builder()
                .data(brandService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{brandId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> restoreBrand(@PathVariable String brandId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("brand.restored.success", brandService.restore(brandId)))
                .build();
    }

}
