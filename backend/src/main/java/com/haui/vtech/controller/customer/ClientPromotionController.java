package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.promotion.PromotionResponse;
import com.haui.vtech.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/promotions")
@RequiredArgsConstructor
public class ClientPromotionController {

    private final PromotionService promotionService;

    @GetMapping("/active")
    public ApiResponse<List<PromotionResponse>> getActivePromotions() {
        return ApiResponse.<List<PromotionResponse>>builder()
                .data(promotionService.getActivePromotionsForClient())
                .message("Lấy danh sách khuyến mãi đang diễn ra thành công")
                .build();
    }
}