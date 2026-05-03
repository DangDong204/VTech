package com.haui.vtech.service;

import com.haui.vtech.dto.chat.ChatRequest;
import com.haui.vtech.dto.chat.ChatResponse;
import com.haui.vtech.entity.ChatMessageEntity;
import com.haui.vtech.entity.ChatSessionEntity;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.ChatRole;
import com.haui.vtech.repository.ChatMessageRepository;
import com.haui.vtech.repository.ChatSessionRepository;
import com.haui.vtech.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ChatbotService {

    private final ChatClient chatClient;
    private final ChatSessionRepository sessionRepo;
    private final ChatMessageRepository messageRepo;
    private final UserRepository userRepo;

    public ChatbotService(ChatClient.Builder chatClientBuilder,
                          ChatSessionRepository sessionRepo,
                          ChatMessageRepository messageRepo,
                          UserRepository userRepo) {
        this.chatClient = chatClientBuilder.build();
        this.sessionRepo = sessionRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
    }

    private final String SYSTEM_PROMPT = """
            Bạn là VTech Assistant - Nhân viên tư vấn bán hàng trực tuyến của cửa hàng đồ công nghệ VTech (bán điện thoại, laptop, phụ kiện).
            Hãy luôn trả lời lịch sự, ngắn gọn và hữu ích.
            - Nếu khách hỏi tìm sản phẩm, dùng công cụ searchProductTool.
            - Nếu khách hỏi chi tiết sản phẩm, dùng công cụ productDetailTool.
            - Nếu khách hỏi về khuyến mãi, giảm giá, dùng công cụ promotionTool.
            - Nếu khách muốn mua hoặc thêm vào giỏ hàng, dùng công cụ addToCartTool.
            - Nếu khách hỏi tình trạng đơn hàng của họ, dùng công cụ orderTrackingTool.
            - Nếu khách hỏi về điểm thưởng V-point, hạng thẻ thành viên hoặc đổi ưu đãi, dùng công cụ vpointTrackingTool.
            Đơn vị tiền tệ luôn là VNĐ.
            """;

    @Transactional
    public ChatResponse processChat(ChatRequest request, String userId) {

        ChatSessionEntity session;

        // 1. Quản lý Session
        if (request.getSessionId() == null || request.getSessionId().isEmpty()) {
            session = new ChatSessionEntity();
            session.setId(UUID.randomUUID().toString());
            if (userId != null) {
                UserEntity user = userRepo.findById(userId).orElse(null);
                session.setUser(user);
            }
            session.setTitle(request.getMessage().substring(0, Math.min(request.getMessage().length(), 30)));
            session = sessionRepo.save(session);
        } else {
            session = sessionRepo.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên chat"));
        }

        // 2. Lưu câu hỏi của User vào DB
        ChatMessageEntity userMsgEntity = ChatMessageEntity.builder()
                .session(session)
                .role(ChatRole.USER)
                .content(request.getMessage())
                .build();
        messageRepo.save(userMsgEntity);

        // 3. Chuẩn bị Context (Lịch sử chat) để gửi cho AI
        List<Message> aiMessages = new ArrayList<>();

        // --- CHÌA KHÓA BẮT LỖI KHÁCH VÃNG LAI NẰM Ở ĐÂY ---
        boolean isAuthenticated = (userId != null && !userId.isBlank());
        String loginContext = isAuthenticated
                ? "\n[TRẠNG THÁI KHÁCH HÀNG]: Khách ĐÃ ĐĂNG NHẬP. Bạn ĐƯỢC PHÉP dùng các công cụ yêu cầu tài khoản như addToCartTool và orderTrackingTool."
                : "\n[TRẠNG THÁI KHÁCH HÀNG]: Khách CHƯA ĐĂNG NHẬP. Bạn TUYỆT ĐỐI KHÔNG GỌI addToCartTool và orderTrackingTool. Nếu khách yêu cầu các việc này, hãy từ chối khéo léo và nói: 'Dạ để sử dụng tính năng này, bạn vui lòng đăng nhập tài khoản trên website trước giúp mình nhé ạ!'";

        // Trộn chung System Prompt và Trạng thái hiện tại
        aiMessages.add(new SystemMessage(SYSTEM_PROMPT + loginContext));

        // Load lịch sử chat cũ
        List<ChatMessageEntity> history = messageRepo.findTop10BySessionIdOrderByCreatedAtAsc(session.getId());
        for (ChatMessageEntity msg : history) {
            if (msg.getRole() == ChatRole.USER) {
                aiMessages.add(new UserMessage(msg.getContent()));
            } else if (msg.getRole() == ChatRole.ASSISTANT) {
                aiMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        // Thêm câu hỏi hiện tại
        aiMessages.add(new UserMessage(request.getMessage()));

        // 4. GỌI SPRING AI (Nạp đủ 5 công cụ)
        log.info("Bắt đầu gọi AI cho session: {}", session.getId());

        String aiResponseText = chatClient.prompt()
                .messages(aiMessages)
                .functions("searchProductTool", "productDetailTool", "addToCartTool", "promotionTool", "orderTrackingTool", "vpointTrackingTool")
                .call()
                .content();

        // 5. Lưu câu trả lời của AI vào DB
        ChatMessageEntity botMsgEntity = ChatMessageEntity.builder()
                .session(session)
                .role(ChatRole.ASSISTANT)
                .content(aiResponseText)
                .build();
        messageRepo.save(botMsgEntity);

        return new ChatResponse(session.getId(), aiResponseText);
    }
}