package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductVariantRequest;
import com.haui.vtech.dto.product.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse create(ProductVariantRequest request);

    List<ProductVariantResponse> getByProductId(String productId);

    ProductVariantResponse getById(String id);

    ProductVariantResponse update(String id, ProductVariantRequest request);

    String delete(String id);
}
