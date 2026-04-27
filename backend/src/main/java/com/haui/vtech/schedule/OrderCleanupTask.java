package com.haui.vtech.schedule;

import com.haui.vtech.entity.OrderDetailEntity;
import com.haui.vtech.entity.OrderEntity;
import com.haui.vtech.entity.OrderHistoryEntity;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.repository.OrderRepository;
import com.haui.vtech.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupTask {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;

    // Chạy ngầm định kỳ mỗi 5 phút (300000 ms)
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanupAbandonedOrders() {
        // Mốc thời gian giới hạn là 15 phút trước so với hiện tại
        LocalDateTime fifteenMinsAgo = LocalDateTime.now().minusMinutes(15);

        List<OrderEntity> abandonedOrders = orderRepository.findAbandonedVnPayOrders(fifteenMinsAgo);

        if (!abandonedOrders.isEmpty()) {
            log.info("CronJob: Tìm thấy {} đơn hàng VNPAY quá hạn 15 phút. Bắt đầu tự động hủy...", abandonedOrders.size());

            for (OrderEntity order : abandonedOrders) {
                // 1. Trả lại tồn kho
                for (OrderDetailEntity detail : order.getOrderDetails()) {
                    ProductVariantEntity variant = variantRepository.findById(detail.getVariantId()).orElse(null);
                    if (variant != null) {
                        variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
                        variantRepository.save(variant);
                    }
                }

                // 2. Cập nhật trạng thái
                OrderStatus oldStatus = order.getOrderStatus();
                order.setOrderStatus(OrderStatus.CANCELLED);

                // 3. Ghi log
                OrderHistoryEntity history = OrderHistoryEntity.builder()
                        .order(order)
                        .oldStatus(oldStatus)
                        .newStatus(OrderStatus.CANCELLED)
                        .note("Hệ thống tự động hủy đơn do quá 15 phút không hoàn tất thanh toán VNPAY.")
                        .createdBy("SYSTEM")
                        .build();
                order.getOrderHistories().add(history);
            }

            orderRepository.saveAll(abandonedOrders);
            log.info("CronJob: Đã hủy thành công và nhả tồn kho cho {} đơn hàng.", abandonedOrders.size());
        }
    }
}
