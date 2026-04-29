package com.haui.vtech.service;

import com.haui.vtech.dto.article.ArticleRequest;
import com.haui.vtech.dto.article.ArticleResponse;

import java.util.List;

public interface ArticleService {

    ArticleResponse createArticle(ArticleRequest request, String authorId);

    ArticleResponse updateArticle(String id, ArticleRequest request);

    void deleteArticle(String id);

    ArticleResponse getArticleById(String id);

    ArticleResponse getArticleBySlug(String slug); // Có tăng view

    List<ArticleResponse> getAdminArticles();

    List<ArticleResponse> getClientArticles();

    List<ArticleResponse> getTrashedArticles();

    void restoreArticle(String id);

    void hardDeleteArticle(String id);
}