package com.haui.vtech.schedule;

import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.VpointTransactionType;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.repository.VpointHistoryRepository;
import com.haui.vtech.service.EmailService; // Nếu bạn muốn gửi mail chúc mừng
import com.haui.vtech.service.VpointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BirthdayReward {

    private final UserRepository userRepository;
    private final VpointHistoryRepository vpointHistoryRepository;
    private final VpointService vpointService;
    private final EmailService emailService; // Tiêm vào nếu muốn gửi mail

    // Cấu hình số điểm tặng dịp sinh nhật (Tùy bạn set, ở đây ví dụ là 500 điểm)
    private static final int BIRTHDAY_BONUS_POINTS = 500;

    /**
     * Chạy định kỳ vào lúc 08:00:00 Sáng mỗi ngày
     * Cron expression: Giây Phút Giờ Ngày Tháng NgàyTrongTuần
     */
    @Scheduled(cron = "0 0 8 * * ?")
//    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void processBirthdayRewards() {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentDay = today.getDayOfMonth();
        int currentYear = today.getYear();

        log.info("--- BẮT ĐẦU CHẠY JOB TẶNG ĐIỂM SINH NHẬT NGÀY {}/{} ---", currentDay, currentMonth);

        // 1. Lấy danh sách user sinh nhật hôm nay
        List<UserEntity> birthdayUsers = userRepository.findUsersByBirthday(currentMonth, currentDay);

        if (birthdayUsers.isEmpty()) {
            log.info("Không có khách hàng nào sinh nhật hôm nay.");
            return;
        }

        int countSuccess = 0;

        // 2. Duyệt qua từng user và tặng điểm
        for (UserEntity user : birthdayUsers) {
            try {
                // Kiểm tra xem năm nay đã tặng chưa (chống spam)
                boolean alreadyGifted = vpointHistoryRepository.existsBirthdayGiftThisYear(
                        user.getId(),
                        VpointTransactionType.EARN_BIRTHDAY,
                        currentYear
                );

                if (!alreadyGifted) {
                    // Gọi hàm addPoints của VpointService
                    vpointService.addPoints(
                            user.getId(),
                            BIRTHDAY_BONUS_POINTS,
                            VpointTransactionType.EARN_BIRTHDAY,
                            null, // Không có OrderID nên để null
                            "Quà tặng sinh nhật từ VTech!"
                    );

                    // Tùy chọn: Gửi email chúc mừng sinh nhật
                    if (user.getEmail() != null && !user.getEmail().isBlank()) {
                        // emailService.sendBirthdayEmail(user.getEmail(), user.getFullName(), BIRTHDAY_BONUS_POINTS);
                    }

                    countSuccess++;
                    log.info("Đã tặng {} điểm sinh nhật cho User: {}", BIRTHDAY_BONUS_POINTS, user.getEmail());
                }
            } catch (Exception e) {
                log.error("Lỗi khi tặng điểm sinh nhật cho User: {} - Lỗi: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("--- HOÀN THÀNH JOB SINH NHẬT: Tặng thành công {}/{} khách hàng ---", countSuccess, birthdayUsers.size());
    }
}
