package com.haui.vtech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${gemini.api-url}")
    private String apiUrl;

    @Value("${gemini.api-key}")
    private String apiKey;

    public String generateArticleContent(String topic) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 1. Tạo Prompt chuyên nghiệp ép AI trả về HTML
        String prompt = "Bạn là một chuyên gia Review công nghệ. Hãy viết một bài viết phân tích chi tiết và chuẩn SEO dài khoảng 500-700 từ về chủ đề: '" + topic + "'.\n" +
                "YÊU CẦU BẮT BUỘC:\n" +
                "- Trả về trực tiếp bằng mã HTML (chỉ sử dụng các thẻ <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>).\n" +
                "- KHÔNG bọc kết quả trong block code markdown (như ```html).\n" +
                "- Viết giọng văn thu hút, khách quan, phân tích rõ ưu nhược điểm.";

        // 2. Build cấu trúc JSON an toàn bằng Map (tránh lỗi escape ký tự)
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(contents, headers);

        try {
            // 3. Gọi API và bóc tách lấy nội dung text trả về
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(apiUrl + "?key=" + apiKey, request, JsonNode.class);
            JsonNode root = response.getBody();

            if (root != null && root.has("candidates")) {
                String htmlContent = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                // Loại bỏ tag ```html nếu AI lỡ may vẫn trả về
                return htmlContent.replace("```html", "").replace("```", "").trim();
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Lỗi 4xx (Lỗi từ phía mình: Sai URL, Sai API Key, Gọi quá giới hạn)
            System.err.println("LỖI REQUEST: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);

        } catch (org.springframework.web.client.HttpServerErrorException e) {
            // Lỗi 5xx (Lỗi từ phía Google: Sập server, Quá tải 503)
            System.err.println("SERVER GOOGLE QUÁ TẢI (503): Vui lòng thử lại sau vài giây.");
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);

        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}