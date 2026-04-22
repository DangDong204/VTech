package com.haui.vtech.repository;

import com.haui.vtech.entity.PromotionEntity;
import com.haui.vtech.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, String> {

    boolean existsByPromotionName(String promotionName);

    List<PromotionEntity> findByStatusNot(PromotionStatus status);

    @Modifying
    @Query("""
        update PromotionEntity p
        set p.status = 'DELETED',
            p.deletedAt = :deletedAt
        where p.id = :id
          and p.deletedAt is null
    """)
    int softDelete(@Param("id") String id, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("""
        update PromotionEntity p
        set p.status = 'ACTIVE',
            p.deletedAt = null
        where p.id = :id
          and p.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<PromotionEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(PromotionStatus status);

    @Query("SELECT DISTINCT p FROM PromotionEntity p JOIN p.variantIds v WHERE p.status = 'ACTIVE' AND v IN :variantIds")
    List<PromotionEntity> findActivePromotionsByVariantIds(@Param("variantIds") Set<String> variantIds);
}