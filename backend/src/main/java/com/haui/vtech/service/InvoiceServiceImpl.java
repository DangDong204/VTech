package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final SpringTemplateEngine templateEngine;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String orderId) {
        // 1. Lấy thông tin đơn hàng
        OrderResponse order = orderService.getOrderDetailForAdmin(orderId);

        // ĐIỀU KIỆN BẮT BUỘC: CHỈ XUẤT KHI CONFIRMED HOẶC PROCESSING
        if (order.getOrderStatus() != com.haui.vtech.enums.OrderStatus.CONFIRMED &&
                order.getOrderStatus() != com.haui.vtech.enums.OrderStatus.PROCESSING) {
            throw new com.haui.vtech.exception.AppException(com.haui.vtech.exception.ErrorCode.ORDER_CANNOT_EXPORT_INVOICE);
        }

        // 2. Truyền dữ liệu vào context của Thymeleaf
        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
        context.setVariable("order", order);

        // 3. Render file 'invoice.html' thành chuỗi HTML động
        String htmlContent = templateEngine.process("invoice", context);

        // 4. Convert chuỗi HTML sang mảng byte PDF
        java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
        com.itextpdf.html2pdf.HtmlConverter.convertToPdf(htmlContent, outputStream);

        return outputStream.toByteArray();
    }
}