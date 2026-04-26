package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.dto.order.UpdateOrderStatusRequest;
import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.OrderService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final MessageUtil messageUtil;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .data(orderService.getAllOrders())
                .build();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<OrderResponse> getOrderDetail(@PathVariable String orderId) {
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.getOrderDetailForAdmin(orderId))
                .build();
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        String adminId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.updateOrderStatus(adminId, orderId, request.getNewStatus(), request.getNote()))
                .message(messageUtil.getMessage("order.status.updated.success"))
                .build();
    }
}