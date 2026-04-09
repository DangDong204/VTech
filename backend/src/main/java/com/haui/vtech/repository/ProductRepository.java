package com.haui.vtech.repository;

import com.haui.vtech.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {

    boolean existsBySlug(String slug);

    boolean existsByProductName(String productName);

}
