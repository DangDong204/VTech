package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.article.ArticleResponse;
import com.haui.vtech.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/articles")
@RequiredArgsConstructor
public class ClientArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ApiResponse<List<ArticleResponse>> getPublishedArticles () {
        return ApiResponse.<List<ArticleResponse>>builder()
                .data(articleService.getClientArticles())
                .build();
    }

    @GetMapping("/{slug}")
    public ApiResponse<ArticleResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.<ArticleResponse>builder()
                .data(articleService.getArticleBySlug(slug))
                .build();
    }
}