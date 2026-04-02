package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.brand.BrandUpdateRequest;
import com.haui.vtech.service.BrandService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<BrandResponse> createBrand(
            @Valid @ModelAttribute BrandCreationRequest request,
            @RequestPart(required = false) MultipartFile brandLogo
    ) {
        return ApiResponse.<BrandResponse>builder()
                .data(brandService.create(request, brandLogo))
                .message(messageUtil.getMessage("created.success"))
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
    public ApiResponse<BrandResponse> updateBrand(
            @PathVariable String brandId,
            @Valid @ModelAttribute BrandUpdateRequest request,
            @RequestPart(required = false) MultipartFile brandLogo
    ) {
        return ApiResponse.<BrandResponse>builder()
                .data(brandService.update(brandId, request, brandLogo))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    @DeleteMapping("/trash/{brandId}")
    public ApiResponse<Void> deleteBrand(@PathVariable String brandId) {
        brandService.delete(brandId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @DeleteMapping("/{brandId}")
    public ApiResponse<Void> deleteSoftBrand(@PathVariable String brandId) {
        brandService.deleteSoft(brandId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<BrandResponse>> getAllInTrash() {
        return ApiResponse.<List<BrandResponse>>builder()
                .data(brandService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{brandId}")
    public ApiResponse<Void> restoreBrand(@PathVariable String brandId) {
        brandService.restore(brandId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }

}
