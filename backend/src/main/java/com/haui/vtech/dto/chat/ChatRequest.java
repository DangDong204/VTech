package com.haui.vtech.dto.chat;

import lombok.Data;

@Data
public class ChatRequest {
    private String sessionId; // Truyền lên nếu đang chat tiếp, null nếu là đoạn chat mới
    private String message;
}