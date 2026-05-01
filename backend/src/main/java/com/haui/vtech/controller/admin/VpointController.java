package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.vpoint.VpointHistoryResponse;
import com.haui.vtech.enums.VpointTransactionType;
import com.haui.vtech.service.VpointService;
import com.haui.vtech.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vpoint")
@RequiredArgsConstructor
public class VpointController {

    private final VpointService vpointService;
    private final MessageUtil messageUtil;

    // API Cho người dùng xem lịch sử điểm của mình (Hoặc admin xem của user)
    @GetMapping("/history/{userId}")
    public ApiResponse<List<VpointHistoryResponse>> getHistory(@PathVariable String userId) {
        return ApiResponse.<List<VpointHistoryResponse>>builder()
                .data(vpointService.getUserHistory(userId))
                .build();
    }

    // API Dành cho Admin tặng điểm thủ công (để Test hoặc giải quyết khiếu nại)
    @PostMapping("/admin/add/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> addPointsManually(
            @PathVariable String userId,
            @RequestParam int amount,
            @RequestParam String description
    ) {
        vpointService.addPoints(userId, amount, VpointTransactionType.EARN_ADMIN_GIFT, null, description);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("vpoint.added.success"))
                .build();
    }
}