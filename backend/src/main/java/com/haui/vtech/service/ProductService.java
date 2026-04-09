package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductCreationRequest request);

    List<ProductResponse> getAllProducts();
}
