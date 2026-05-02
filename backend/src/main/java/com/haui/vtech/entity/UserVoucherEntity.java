package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_vouchers")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserVoucherEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.EAGER) // Nên dùng EAGER để khi lấy ví voucher ra là có luôn thông tin giảm giá
    @JoinColumn(name = "voucher_id", nullable = false)
    private VoucherEntity voucher;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (isUsed == null) {
            isUsed = false;
        }
    }
}