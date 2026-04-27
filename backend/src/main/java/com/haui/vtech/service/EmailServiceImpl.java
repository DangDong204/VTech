package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    @Async
    public void sendOrderStatusEmail(String to, OrderResponse order, String translatedStatus) { // SỬA THAM SỐ Ở ĐÂY
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Cập nhật trạng thái đơn hàng " + order.getOrderCode() + " - VTech Store");

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("statusName", translatedStatus);

            String html = templateEngine.process("send-email", context);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Đã gửi email cập nhật trạng thái đơn {} tới {}", order.getOrderCode(), to);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email: ", e);
        }
    }
}