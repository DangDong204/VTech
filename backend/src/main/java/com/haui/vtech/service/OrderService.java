package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(String userId, OrderRequest request);

    List<OrderResponse> getMyOrders(String userId);

    OrderResponse getOrderDetail(String userId, String orderId);

    OrderResponse cancelOrder(String userId, String orderId, String cancelReason);
}
