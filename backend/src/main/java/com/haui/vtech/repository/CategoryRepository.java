package com.haui.vtech.repository;

import com.haui.vtech.entity.CategoryEntity;
import com.haui.vtech.enums.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {
    boolean existsBySlug(String slug);

    List<CategoryEntity> findByStatusNot(CategoryStatus categoryStatus);

    @Modifying
    @Query("""
        update CategoryEntity c
        set c.status = DELETED,
            c.deletedAt = :deletedAt
        where c.id = :id
          and c.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update CategoryEntity c
        set c.status = ACTIVE,
            c.deletedAt = null
        where c.id = :id
          and c.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<CategoryEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(CategoryStatus categoryStatus);

    boolean existsByParentId(String id);
}
