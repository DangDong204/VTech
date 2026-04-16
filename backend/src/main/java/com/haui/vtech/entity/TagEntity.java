package com.haui.vtech.entity;

import com.haui.vtech.enums.ProductStatus;
import com.haui.vtech.enums.TagStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tags")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class TagEntity extends BaseEntity{

    @Column(name = "tag_name", nullable = false, unique = true)
    private String tagName;

    @Column(name = "tag_desc")
    private String tagDesc;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TagStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) status = TagStatus.ACTIVE;
    }

    // Quan hệ N-N với Product
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<ProductEntity> products =  new HashSet<>();

}
