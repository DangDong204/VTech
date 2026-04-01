package com.haui.vtech.repository;

import com.haui.vtech.entity.BrandEntity;
import com.haui.vtech.enums.BrandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BrandRepository extends JpaRepository<BrandEntity, String> {
    boolean existsBySlug(String slug);

    List<BrandEntity> findByStatusNot(BrandStatus status);

    @Modifying
    @Query("""
        update BrandEntity b
        set b.status = DELETED,
            b.deletedAt = :deletedAt
        where b.id = :id
          and b.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update BrandEntity b
        set b.status = ACTIVE,
            b.deletedAt = null
        where b.id = :id
          and b.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<BrandEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(BrandStatus brandStatus);
}
