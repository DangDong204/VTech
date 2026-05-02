package com.haui.vtech.service;

import com.haui.vtech.dto.vpoint.VpointHistoryResponse;
import com.haui.vtech.enums.VpointTransactionType;

import java.util.List;

public interface VpointService {
    // Hàm cốt lõi để cộng điểm
    void addPoints(String userId, int amount, VpointTransactionType type, String referenceId, String description);

    void deductPoints(String userId, int amount, VpointTransactionType type, String referenceId, String description);
    // Lấy lịch sử điểm của một người dùng
    List<VpointHistoryResponse> getUserHistory(String userId);
}