package com.haui.vtech.repository;

import com.haui.vtech.entity.ProductVariantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, String> {

    List<ProductVariantEntity> findByProductId(String productId);

    boolean existsBySku(String sku);

    boolean existsByProductIdAndColorIdAndVersionId(String productId, String colorId, String versionId);

    // Thêm hàm này để truy vấn hàng loạt SKU từ file Excel
    List<ProductVariantEntity> findBySkuIn(List<String> skus);
}
