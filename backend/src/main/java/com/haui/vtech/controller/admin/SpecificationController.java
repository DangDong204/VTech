package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.product.SpecificationRequest;
import com.haui.vtech.dto.product.SpecificationResponse;
import com.haui.vtech.service.SpecificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products/{productId}/specification")
@RequiredArgsConstructor
public class SpecificationController {

    private final SpecificationService specificationService;

    @PostMapping
    public ApiResponse<SpecificationResponse> createSpec(
            @PathVariable String productId,
            @RequestBody SpecificationRequest request) {

        return ApiResponse.<SpecificationResponse>builder()
                .data(specificationService.create(productId, request))
                .build();
    }

    @GetMapping
    public ApiResponse<SpecificationResponse> getSpecByProductId(@PathVariable String productId) {
        return ApiResponse.<SpecificationResponse>builder()
                .data(specificationService.getByProductId(productId))
                .build();
    }

    @PutMapping
    public ApiResponse<SpecificationResponse> updateSpec(
            @PathVariable String productId,
            @RequestBody SpecificationRequest request) {

        return ApiResponse.<SpecificationResponse>builder()
                .data(specificationService.update(productId, request))
                .build();
    }

}
