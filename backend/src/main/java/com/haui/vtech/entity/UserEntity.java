package com.haui.vtech.entity;

import com.haui.vtech.enums.Gender;
import com.haui.vtech.enums.MemberTier;
import com.haui.vtech.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity extends BaseEntity {

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "avatar", length = 500)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles;

    @Column(name = "dob")
    private java.time.LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "current_vpoint", nullable = false)
    private Integer currentVpoint = 0;

    @Column(name = "total_vpoint", nullable = false)
    private Integer totalVpoint = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_tier", nullable = false, length = 20)
    private MemberTier memberTier = MemberTier.MEMBER;

    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @Column(name = "otp_expiry_time")
    private LocalDateTime otpExpiryTime;

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) {
            status = UserStatus.PENDING;
        }
        if (currentVpoint == null) {
            currentVpoint = 0;
        }
        if (totalVpoint == null) {
            totalVpoint = 0;
        }
        if (memberTier == null) {
            memberTier = MemberTier.MEMBER;
        }
    }
}
