package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.dto.order.UpdateOrderStatusRequest;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.InvoiceService;
import com.haui.vtech.service.OrderService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final InvoiceService invoiceService;

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

    @GetMapping("/{orderId}/export-invoice")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<byte[]> exportInvoice(@PathVariable String orderId) {
        // Tạo file PDF
        byte[] pdfBytes = invoiceService.generateInvoicePdf(orderId);

        // Lấy thông tin mã đơn để đặt tên file cho đẹp
        OrderResponse order = orderService.getOrderDetailForAdmin(orderId);
        String fileName = "Hoa_Don_" + order.getOrderCode() + ".pdf";

        // Đóng gói vào HttpHeaders để trình duyệt hiểu đây là file tải xuống
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}