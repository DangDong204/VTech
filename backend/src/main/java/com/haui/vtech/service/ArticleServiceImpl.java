package com.haui.vtech.service;

import com.haui.vtech.dto.article.ArticleRequest;
import com.haui.vtech.dto.article.ArticleResponse;
import com.haui.vtech.entity.ArticleEntity;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.ArticleStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ArticleMapper;
import com.haui.vtech.repository.ArticleRepository;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ArticleMapper articleMapper;

    @Override
    @Transactional
    public ArticleResponse createArticle(ArticleRequest request, String authorId) {
        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String slug = generateSlug(request.getTitle());
        if (articleRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis(); // Tránh trùng lặp tuyệt đối
        }

        ArticleEntity article = articleMapper.toEntity(request);
        article.setSlug(slug);
        article.setAuthor(author);

        // Gắn sản phẩm nếu có
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            List<ProductEntity> products = productRepository.findAllById(request.getProductIds());
            article.setProducts(new HashSet<>(products));
        }

        return articleMapper.toResponse(articleRepository.save(article));
    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(String id, ArticleRequest request) {
        ArticleEntity article = articleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        String newSlug = generateSlug(request.getTitle());
        if (articleRepository.existsBySlugAndIdNot(newSlug, id)) {
            newSlug = newSlug + "-" + System.currentTimeMillis();
        }

        articleMapper.updateEntity(article, request);
        article.setSlug(newSlug);

        if (request.getProductIds() != null) {
            List<ProductEntity> products = productRepository.findAllById(request.getProductIds());
            article.setProducts(new HashSet<>(products));
        }

        return articleMapper.toResponse(articleRepository.save(article));
    }

    @Override
    @Transactional
    public void deleteArticle(String id) {
        ArticleEntity article = articleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        article.setDeletedAt(LocalDateTime.now()); // Xóa mềm
        articleRepository.save(article);
    }

    @Override
    public ArticleResponse getArticleById(String id) {
        return articleRepository.findByIdAndDeletedAtIsNull(id)
                .map(articleMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
    }

    @Override
    @Transactional
    public ArticleResponse getArticleBySlug(String slug) {
        ArticleEntity article = articleRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        // Chỉ khách hàng mới gọi qua slug -> Tăng view
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);

        return articleMapper.toResponse(article);
    }

    @Override
    public List<ArticleResponse> getAdminArticles() {
        return articleRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream().map(articleMapper::toResponse).toList();
    }

    @Override
    public List<ArticleResponse> getClientArticles() {
        return articleRepository.findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(ArticleStatus.PUBLISHED)
                .stream().map(articleMapper::toResponse).toList();
    }

    @Override
    public List<ArticleResponse> getTrashedArticles() {
        return articleRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream().map(articleMapper::toResponse).toList();
    }


    @Override
    @Transactional
    public void restoreArticle(String id) {
        ArticleEntity article = articleRepository.findByIdAndDeletedAtIsNotNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        article.setDeletedAt(null);
        articleRepository.save(article);
    }



    @Override
    @Transactional
    public void hardDeleteArticle(String id) {
        // Tìm bài viết TRONG THÙNG RÁC để xóa vĩnh viễn
        ArticleEntity article = articleRepository.findByIdAndDeletedAtIsNotNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        // Gọi lệnh delete() của JPA để xóa cứng khỏi Database
        articleRepository.delete(article);
    }

    // Hàm tiện ích tạo Slug từ Tiêu đề
    private String generateSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}