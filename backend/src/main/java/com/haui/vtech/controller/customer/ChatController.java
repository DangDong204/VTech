package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.chat.ChatRequest;
import com.haui.vtech.dto.chat.ChatResponse;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/client/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    @PostMapping
    public ApiResponse<ChatResponse> chat(@RequestBody ChatRequest request) {
        String userId = null;

        // Kiểm tra xem user có đang đăng nhập không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Nếu có Authen và không phải là khách vãng lai (anonymousUser)
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            Optional<UserEntity> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }

        // Gọi service xử lý (nếu userId = null thì hệ thống vẫn xử lý bình thường với quyền khách)
        ChatResponse response = chatbotService.processChat(request, userId); // Đổi biến hứng

        return ApiResponse.<ChatResponse>builder()
                .data(response)
                .message("Thành công")
                .build();
    }
}