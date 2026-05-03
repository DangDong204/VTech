package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatSessionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    UserEntity user; // Nullable: Nếu User đăng nhập thì gán vào, không thì null (guest)

    @Column(name = "title")
    String title; // Gợi ý: Sau này có thể dùng AI tự động tóm tắt nội dung hội thoại thành Title

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ChatMessageEntity> messages;
}