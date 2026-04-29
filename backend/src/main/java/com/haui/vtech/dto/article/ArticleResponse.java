package com.haui.vtech.dto.article;

import com.haui.vtech.enums.ArticleStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArticleResponse {
    private String id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String thumbnail;
    private String authorName; // Chỉ lấy tên tác giả
    private Integer viewCount;
    private ArticleStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private Set<ArticleProductDto> products; // DTO rút gọn của sản phẩm
}