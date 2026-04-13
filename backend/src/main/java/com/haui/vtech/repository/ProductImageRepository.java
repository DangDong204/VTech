package com.haui.vtech.repository;

import com.haui.vtech.entity.ProductImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImageEntity, String> {

    ProductImageEntity findByProductIdAndIsThumbnailTrue(String productId);

    List<ProductImageEntity> findByProductIdOrderByDisplayOrderAsc(String productId);

}
