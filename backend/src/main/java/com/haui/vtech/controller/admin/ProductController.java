package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.service.ProductService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(
            @Valid @ModelAttribute ProductCreationRequest request) {
        ProductResponse response = productService.create(request);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("product.created.success", response.getProductName()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts(){
        return ApiResponse.<List<ProductResponse>>builder()
                .data(productService.getAllProducts())
                .build();
    }
}
