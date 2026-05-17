package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.promotion.PromotionRequest;
import com.haui.vtech.dto.promotion.PromotionResponse;
import com.haui.vtech.service.PromotionService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final MessageUtil messageUtil;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        PromotionResponse response = promotionService.create(request);
        return ApiResponse.<PromotionResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("promotion.created.success", response.getPromotionName()))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PromotionResponse>> getAll() {
        return ApiResponse.<List<PromotionResponse>>builder()
                .data(promotionService.getAllPromotions())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PromotionResponse> getById(@PathVariable String id) {
        return ApiResponse.<PromotionResponse>builder()
                .data(promotionService.getById(id))
                .build();
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PromotionResponse> updatePromotion(
            @PathVariable String id,
            @Valid @RequestBody PromotionRequest request
    ) {
        PromotionResponse response = promotionService.update(id, request);
        return ApiResponse.<PromotionResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("promotion.updated.success", response.getPromotionName()))
                .build();
    }

    @DeleteMapping("/trash/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deletePromotion(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("promotion.deleted.success", promotionService.deleteHard(id)))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSoftPromotion(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("promotion.deleted.soft.success", promotionService.deleteSoft(id)))
                .build();
    }

    @GetMapping("/trash")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PromotionResponse>> getAllInTrash() {
        return ApiResponse.<List<PromotionResponse>>builder()
                .data(promotionService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> restorePromotion(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("promotion.restored.success", promotionService.restore(id)))
                .build();
    }
}
