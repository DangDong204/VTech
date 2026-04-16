package com.haui.vtech.repository;

import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.enums.ProductStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {

    boolean existsBySlug(String slug);

    boolean existsByProductName(String productName);

    boolean existsByBrandId(String brandId);

    boolean existsByCategoryId(String categoryId);

    boolean existsByTags_Id(String tagId);

    @EntityGraph(attributePaths = {"images", "tags"})
    List<ProductEntity> findByStatusNot(ProductStatus productStatus);

    List<ProductEntity> findByTags_IdAndStatus(String tagId, ProductStatus status);

    List<ProductEntity> findByBrandIdAndStatus(String brandId, ProductStatus status);

    List<ProductEntity> findByCategoryIdAndStatus(String categoryId, ProductStatus status);

    @Modifying
    @Query("""
        update ProductEntity p
        set p.status = DELETED,
            p.deletedAt = :deletedAt
        where p.id = :id
          and p.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update ProductEntity p
        set p.status = ACTIVE,
            p.deletedAt = null
        where p.id = :id
          and p.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<ProductEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(ProductStatus productStatus);

}
