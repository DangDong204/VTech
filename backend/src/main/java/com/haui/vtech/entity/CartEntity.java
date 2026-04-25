package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CartEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    // CascadeType.ALL và orphanRemoval giúp xóa giỏ hàng thì chi tiết cũng bay theo
    @Builder.Default
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CartDetailEntity> cartDetails = new ArrayList<>();
}