package com.haui.vtech.repository;

import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.enums.ProductStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {

    boolean existsBySlug(String slug);

    boolean existsByProductName(String productName);

    boolean existsByBrandId(String brandId);

    boolean existsByCategoryId(String categoryId);

    boolean existsByTags_Id(String tagId);

    List<ProductEntity> findByStatus(ProductStatus status);

    Optional<ProductEntity> findBySlugAndStatus(String slug, ProductStatus status);

    @Query("SELECT DISTINCT p FROM ProductEntity p " +
            "LEFT JOIN p.variants v " +
            "LEFT JOIN p.tags t " +
            "WHERE p.status = 'ACTIVE' " +
            "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
            "AND (:brandSlug IS NULL OR p.brand.slug = :brandSlug) " +
            "AND (:tagId IS NULL OR t.id = :tagId) " +
            "AND (:keyword IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " + // THÊM DÒNG NÀY
            "AND (:minPrice IS NULL OR v.salePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR v.salePrice <= :maxPrice)")
    List<ProductEntity> searchClientProducts(@Param("categorySlug") String categorySlug,
                                             @Param("brandSlug") String brandSlug,
                                             @Param("tagId") String tagId,
                                             @Param("keyword") String keyword, // THÊM THAM SỐ NÀY
                                             @Param("minPrice") BigDecimal minPrice,
                                             @Param("maxPrice") BigDecimal maxPrice);

    @EntityGraph(attributePaths = {"images", "tags"})
    List<ProductEntity> findByStatusNot(ProductStatus productStatus);

    List<ProductEntity> findByTags_IdAndStatus(String tagId, ProductStatus status);

    List<ProductEntity> findByBrandIdAndStatus(String brandId, ProductStatus status);

    List<ProductEntity> findByCategoryIdAndStatus(String categoryId, ProductStatus status);

    // Lấy các sản phẩm có ít nhất 1 biến thể đang nằm trong chương trình khuyến mãi (Bao gồm cả SẮP DIỄN RA)
    @Query("SELECT DISTINCT p FROM ProductEntity p " +
            "JOIN p.variants v " +
            "JOIN PromotionEntity pr ON v.id IN elements(pr.variantIds) " +
            "WHERE pr.id = :promotionId " +
            "AND pr.status IN ('ACTIVE', 'UPCOMING') " +
            "AND pr.endDate >= CURRENT_TIMESTAMP " +
            "AND p.status = 'ACTIVE'")
    List<ProductEntity> findProductsByPromotionId(@Param("promotionId") String promotionId);

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
