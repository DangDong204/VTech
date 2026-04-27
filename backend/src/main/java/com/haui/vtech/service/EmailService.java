package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.entity.OrderEntity;

public interface EmailService {

    void sendOrderStatusEmail(String to, OrderResponse order, String translatedStatus);

}