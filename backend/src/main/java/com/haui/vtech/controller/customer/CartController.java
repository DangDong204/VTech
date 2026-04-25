package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.cart.CartItemRequest;
import com.haui.vtech.dto.cart.CartResponse;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getMyCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // Lấy ID thật từ JWT Token thông qua CustomUserDetails
        String userId = userDetails.getUser().getId();

        return ApiResponse.<CartResponse>builder()
                .data(cartService.getMyCart(userId))
                .message("Lấy giỏ hàng thành công")
                .build();
    }

    @PostMapping("/add")
    public ApiResponse<CartResponse> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {

        String userId = userDetails.getUser().getId();

        return ApiResponse.<CartResponse>builder()
                .data(cartService.addToCart(userId, request))
                .message("Thêm vào giỏ hàng thành công")
                .build();
    }

    @PutMapping("/update/{cartDetailId}")
    public ApiResponse<CartResponse> updateQuantity(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String cartDetailId,
            @RequestParam Integer quantity) {

        String userId = userDetails.getUser().getId();

        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateQuantity(userId, cartDetailId, quantity))
                .message("Cập nhật số lượng thành công")
                .build();
    }

    @DeleteMapping("/remove/{cartDetailId}")
    public ApiResponse<CartResponse> removeCartItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String cartDetailId) {

        String userId = userDetails.getUser().getId();

        return ApiResponse.<CartResponse>builder()
                .data(cartService.removeCartItem(userId, cartDetailId))
                .message("Xóa sản phẩm thành công")
                .build();
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();

        cartService.clearCart(userId);
        return ApiResponse.<Void>builder()
                .message("Làm sạch giỏ hàng thành công")
                .build();
    }
}