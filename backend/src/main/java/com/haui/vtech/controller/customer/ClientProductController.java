package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.product.ClientProductDetailResponse;
import com.haui.vtech.dto.product.ClientProductResponse;
import com.haui.vtech.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/client/products")
@RequiredArgsConstructor
public class ClientProductController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<List<ClientProductResponse>> getAllClientProducts() {
        return ApiResponse.<List<ClientProductResponse>>builder()
                .data(productService.getAllClientProducts())
                .message("Lấy danh sách sản phẩm thành công")
                .build();
    }

    @GetMapping("/{slug}")
    public ApiResponse<ClientProductDetailResponse> getClientProductDetail(@PathVariable String slug) {
        return ApiResponse.<ClientProductDetailResponse>builder()
                .data(productService.getClientProductDetail(slug))
                .message("Lấy thông tin chi tiết sản phẩm thành công")
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<ClientProductResponse>> searchProducts(
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) String tagId,
            @RequestParam(required = false) String keyword, // THÊM DÒNG NÀY
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) {
        return ApiResponse.<List<ClientProductResponse>>builder()
                .data(productService.searchClientProducts(categorySlug, brandSlug, tagId, keyword, minPrice, maxPrice, sort))
                .message("Tìm kiếm sản phẩm thành công")
                .build();
    }

    @GetMapping("/promotions/{promotionId}")
    public ApiResponse<List<ClientProductResponse>> getProductsByPromotionId(@PathVariable String promotionId) {
        return ApiResponse.<List<ClientProductResponse>>builder()
                .data(productService.getProductsByPromotion(promotionId))
                .message("Lấy danh sách sản phẩm theo ID khuyến mãi thành công")
                .build();
    }
}
