package com.haui.vtech.entity;

import com.haui.vtech.enums.ProductStatus;
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
@Table(name = "products")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class ProductEntity extends BaseEntity{

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "product_desc", columnDefinition = "TEXT")
    private String productDesc;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Column(name = "total_views")
    private Integer totalViews;

    @Column(name = "total_purchases")
    private Integer totalPurchases;

    @Column(name = "rating_avg", precision = 3, scale = 2)
    private BigDecimal ratingAvg;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private BrandEntity brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) status = ProductStatus.ACTIVE;
        if (totalViews == null) totalViews = 0;
        if (totalPurchases == null) totalPurchases = 0;
        if (totalReviews == null) totalReviews = 0;
        if (ratingAvg == null) ratingAvg = BigDecimal.ZERO;
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_tags",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<TagEntity> tags = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductImageEntity> images = new HashSet<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private SpecificationEntity specification;

//    helper method để thêm tag vào product

    public void addTag(TagEntity tag) {
        this.tags.add(tag);
        tag.getProducts().add(this);
    }

    public void removeTag(TagEntity tag) {
        this.tags.remove(tag);
        tag.getProducts().remove(this);
    }

}
