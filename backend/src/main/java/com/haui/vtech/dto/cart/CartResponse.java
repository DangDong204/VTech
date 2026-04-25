package com.haui.vtech.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private String cartId;
    private List<CartItemResponse> items;
    private BigDecimal totalCartValue;
    private Integer totalQuantity;
}
