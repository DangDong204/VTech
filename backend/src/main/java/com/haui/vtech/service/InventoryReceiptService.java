package com.haui.vtech.service;

import com.haui.vtech.dto.receipt.ReceiptRequest;
import com.haui.vtech.dto.receipt.ReceiptResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InventoryReceiptService {

    ReceiptResponse createManual(ReceiptRequest request, String username);

    // Import bằng file Excel
    ReceiptResponse importFromExcel(MultipartFile file, String supplierId, String note, String username);

    // Hàm duyệt phiếu và cộng tồn kho
    ReceiptResponse completeReceipt(String id);

    List<ReceiptResponse> getAllReceipts();

    ReceiptResponse getById(String id);
}
