package com.haui.vtech.service;

import com.haui.vtech.dto.cart.CartItemRequest;
import com.haui.vtech.dto.cart.CartResponse;

public interface CartService {

    CartResponse getMyCart(String userId);

    CartResponse addToCart(String userId, CartItemRequest request);

    CartResponse updateQuantity(String userId, String cartDetailId, Integer quantity);

    CartResponse removeCartItem(String userId, String cartDetailId);

    void clearCart(String userId);
}
