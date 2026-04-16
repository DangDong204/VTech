package com.haui.vtech.repository;

import com.haui.vtech.entity.TagEntity;
import com.haui.vtech.enums.TagStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {

    boolean existsByTagName(String tagName);

    List<TagEntity> findByStatusNot(TagStatus tagStatus);

    @Modifying
    @Query("""
        update TagEntity t
        set t.status = DELETED,
            t.deletedAt = :deletedAt
        where t.id = :id
          and t.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update TagEntity t
        set t.status = ACTIVE,
            t.deletedAt = null
        where t.id = :id
          and t.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<TagEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(TagStatus tagStatus);
}
