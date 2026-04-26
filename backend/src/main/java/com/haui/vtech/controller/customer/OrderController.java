package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.OrderService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {

        String userId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.createOrder(userId, request))
                .message(messageUtil.getMessage("order.created.success"))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ApiResponse.<List<OrderResponse>>builder()
                .data(orderService.getMyOrders(userId))
                .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderDetail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId) {

        String userId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.getOrderDetail(userId, orderId))
                .build();
    }

    @PutMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId,
            @RequestParam(required = false, defaultValue = "Khách hàng tự hủy đơn") String cancelReason) {

        String userId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.cancelOrder(userId, orderId, cancelReason))
                .message(messageUtil.getMessage("order.cancelled.success"))
                .build();
    }

    @PutMapping("/{orderId}/confirm-receipt")
    public ApiResponse<OrderResponse> confirmReceipt(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId) {

        String userId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.confirmReceipt(userId, orderId))
                .message(messageUtil.getMessage("order.receipt.success"))
                .build();
    }

    @PutMapping("/{orderId}/return")
    public ApiResponse<OrderResponse> returnOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId,
            @RequestParam(required = false, defaultValue = "Khách hàng yêu cầu hoàn trả") String returnReason) {

        String userId = userDetails.getUser().getId();
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.returnOrder(userId, orderId, returnReason))
                .message(messageUtil.getMessage("order.returned.success"))
                .build();
    }
}