package com.haui.vtech.entity;

import com.haui.vtech.enums.ChatRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    ChatSessionEntity session;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    ChatRole role;

    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    String content;
}