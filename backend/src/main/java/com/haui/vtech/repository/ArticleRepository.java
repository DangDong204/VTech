package com.haui.vtech.repository;

import com.haui.vtech.entity.ArticleEntity;
import com.haui.vtech.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, String id);

    Optional<ArticleEntity> findBySlugAndDeletedAtIsNull(String slug);
    Optional<ArticleEntity> findByIdAndDeletedAtIsNull(String id);

    // Trang client chỉ lấy bài viết đã PUBLISHED
    List<ArticleEntity> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(ArticleStatus status);

    List<ArticleEntity> findByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<ArticleEntity> findByIdAndDeletedAtIsNotNull(String id);

    List<ArticleEntity> findByDeletedAtIsNotNullOrderByDeletedAtDesc();
}