package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(String userId, OrderRequest request);

    List<OrderResponse> getMyOrders(String userId);

    OrderResponse getOrderDetail(String userId, String orderId);

    OrderResponse cancelOrder(String userId, String orderId, String cancelReason);

    // Dành cho Admin
    List<OrderResponse> getAllOrders();

    OrderResponse getOrderDetailForAdmin(String orderId);

    OrderResponse updateOrderStatus(String adminId, String orderId, OrderStatus newStatus, String note);

    // Dành cho User
    OrderResponse confirmReceipt(String userId, String orderId);

    OrderResponse returnOrder(String userId, String orderId, String returnReason);
}
