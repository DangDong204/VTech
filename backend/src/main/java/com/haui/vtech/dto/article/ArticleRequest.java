package com.haui.vtech.dto.article;

import com.haui.vtech.enums.ArticleStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Set;

@Data
public class ArticleRequest {
    @NotBlank(message = "ARTICLE_TITLE_NOTBLANK")
    private String title;
    private String summary;
    @NotBlank(message = "ARTICLE_CONTENT_NOTBLANK")
    private String content;
    private String thumbnail;
    private ArticleStatus status;
    private Set<String> productIds; // Danh sách ID sản phẩm muốn gắn vào bài viết
}