package com.haui.vtech.entity;

import com.haui.vtech.enums.CategoryStatus;
import com.haui.vtech.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryEntity extends BaseEntity{

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    @Column(name = "slug", nullable = false, length = 100, unique = true)
    private String slug;

    @Column(name = "category_desc", length = 255)
    private String categoryDesc;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "parent_id",  length = 36)
    private String parentId;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CategoryStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) {
            status = CategoryStatus.ACTIVE;
        }
    }
}
