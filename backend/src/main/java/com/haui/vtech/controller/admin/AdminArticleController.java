package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.article.AiGenerateRequest;
import com.haui.vtech.dto.article.ArticleRequest;
import com.haui.vtech.dto.article.ArticleResponse;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.service.AiService;
import com.haui.vtech.service.ArticleService;
import com.haui.vtech.service.S3Service;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;
    private final MessageUtil messageUtil;
    private final S3Service s3Service;
    private final AiService aiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<ArticleResponse>> getAll() {
        return ApiResponse.<List<ArticleResponse>>builder()
                .data(articleService.getAdminArticles())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ArticleResponse> getById(@PathVariable String id) {
        return ApiResponse.<ArticleResponse>builder()
                .data(articleService.getArticleById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ArticleResponse> create(@RequestBody @Valid ArticleRequest request) {

        // CÁCH SỬA: Lấy đối tượng Principal và ép kiểu về CustomUserDetails
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authorId = "";

        if (principal instanceof com.haui.vtech.security.CustomUserDetails customUserDetails) {
            authorId = customUserDetails.getUser().getId(); // Lấy ID thật (UUID) từ UserEntity
        } else {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return ApiResponse.<ArticleResponse>builder()
                .message(messageUtil.getMessage("article.created.success"))
                .data(articleService.createArticle(request, authorId))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ArticleResponse> update(@PathVariable String id, @RequestBody @Valid ArticleRequest request) {
        return ApiResponse.<ArticleResponse>builder()
                .message(messageUtil.getMessage("article.updated.success"))
                .data(articleService.updateArticle(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        articleService.deleteArticle(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("article.deleted.success"))
                .build();
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> restore(@PathVariable String id) {
        articleService.restoreArticle(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("article.restored.success"))
                .build();
    }

    @GetMapping("/trash")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<ArticleResponse>> getTrash() {
        return ApiResponse.<List<ArticleResponse>>builder()
                .data(articleService.getTrashedArticles())
                .build();
    }

    // Xóa cứng (Vĩnh viễn)
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> hardDelete(@PathVariable String id) {
        articleService.hardDeleteArticle(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("article.hard_deleted.success"))
                .build();
    }

    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = s3Service.uploadImage(file, ImageFolder.ARTICLE);
        return ApiResponse.<String>builder()
                .data(url)
                .build();
    }

    @PostMapping("/generate-ai")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<String> generateContentByAi(@RequestBody @Valid AiGenerateRequest request) {
        String htmlContent = aiService.generateArticleContent(request.getPrompt());

        return ApiResponse.<String>builder()
                .message("Tạo bài viết bằng AI thành công")
                .data(htmlContent)
                .build();
    }
}