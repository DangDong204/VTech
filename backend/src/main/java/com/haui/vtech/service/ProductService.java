package com.haui.vtech.service;

import com.haui.vtech.dto.product.*;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse create(ProductCreationRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getById(String id);

    ProductResponse update(String id, ProductUpdateRequest request);

    String delete(String id);

    String deleteSoft(String id);

    List<ProductResponse> getAllInTrash();

    String restore(String id);

    // TODO: getProductsByTag
    List<ProductResponse> getProductsByTag(String tagId);

    // TODO: getProductsByCategory
    List<ProductResponse> getProductsByCategory(String categoryId);

    // TODO: getProductsByBrand
    List<ProductResponse> getProductsByBrand(String brandId);

    List<ClientProductResponse> getAllClientProducts();

    ClientProductDetailResponse getClientProductDetail(String slug);

    List<ClientProductResponse> searchClientProducts(String categorySlug, String brandSlug, String tagId, BigDecimal minPrice, BigDecimal maxPrice, String sort);
}
