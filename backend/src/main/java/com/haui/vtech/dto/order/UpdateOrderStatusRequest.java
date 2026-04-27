package com.haui.vtech.dto.order;

import com.haui.vtech.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatus newStatus;

    private String note;
}