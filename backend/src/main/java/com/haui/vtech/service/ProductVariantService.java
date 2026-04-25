package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductVariantRequest;
import com.haui.vtech.dto.product.ProductVariantResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse create(ProductVariantRequest request, MultipartFile image);

    List<ProductVariantResponse> getByProductId(String productId);

    ProductVariantResponse getById(String id);

    ProductVariantResponse update(String id, ProductVariantRequest request, MultipartFile image);

    String delete(String id);
}
