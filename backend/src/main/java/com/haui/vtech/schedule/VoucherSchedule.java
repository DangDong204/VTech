package com.haui.vtech.schedule;

import com.haui.vtech.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoucherSchedule {
    private final VoucherRepository voucherRepository;

    // Chạy ngầm định kỳ (VD: mỗi 1 phút chạy 1 lần)
    // cron = "0 * * * * ?" nghĩa là chạy vào giây thứ 0 của mỗi phút
    // Nếu muốn chạy 1 tiếng 1 lần: cron = "0 0 * * * ?"
    @Scheduled(cron = "0 * * * * ?")
    public void checkAndDeactivateExpiredVouchers() {
        log.info("Bắt đầu quét và cập nhật trạng thái Voucher hết hạn...");

        int updatedCount = voucherRepository.deactivateExpiredVouchers(LocalDateTime.now());

        if (updatedCount > 0) {
            log.info("Đã chuyển {} voucher sang trạng thái INACTIVE do hết hạn.", updatedCount);
        }
    }
}
