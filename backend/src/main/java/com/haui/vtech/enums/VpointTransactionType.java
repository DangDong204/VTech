package com.haui.vtech.enums;

public enum VpointTransactionType {
    EARN_ORDER,        // Tích điểm mua hàng
    EARN_REVIEW_TEXT,  // Tích điểm đánh giá chữ
    EARN_REVIEW_MEDIA, // Tích điểm đánh giá có ảnh/video
    EARN_BIRTHDAY,     // Quà sinh nhật
    EARN_ADMIN_GIFT,   // Admin tặng điểm thủ công
    SPEND_ORDER,       // Dùng điểm trừ vào đơn hàng
    REFUND_ORDER,      // Hoàn điểm khi hủy đơn
    DEDUCT_RETURN      // Trừ điểm khi hoàn trả hàng (đã tích trước đó)
}