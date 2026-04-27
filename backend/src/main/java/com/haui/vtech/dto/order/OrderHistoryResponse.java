package com.haui.vtech.dto.order;

import com.haui.vtech.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderHistoryResponse {
    private String id;
    private OrderStatus oldStatus;
    private OrderStatus newStatus;
    private String note;
    private LocalDateTime createdAt;
}