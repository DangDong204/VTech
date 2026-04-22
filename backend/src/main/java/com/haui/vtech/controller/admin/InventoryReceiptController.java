package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.receipt.ReceiptRequest;
import com.haui.vtech.dto.receipt.ReceiptResponse;
import com.haui.vtech.service.InventoryReceiptService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory-receipts")
@RequiredArgsConstructor
public class InventoryReceiptController {

    private final InventoryReceiptService receiptService;
    private final MessageUtil messageUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ReceiptResponse> createManual(@Valid @RequestBody ReceiptRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<ReceiptResponse>builder()
                .data(receiptService.createManual(request, username))
                .message(messageUtil.getMessage("receipt.created.success"))
                .build();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ReceiptResponse> importExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "supplierId", required = false) String supplierId,
            @RequestParam(value = "note", required = false) String note
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<ReceiptResponse>builder()
                .data(receiptService.importFromExcel(file, supplierId, note, username))
                .message(messageUtil.getMessage("receipt.import.success"))
                .build();
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ReceiptResponse> completeReceipt(@PathVariable String id) {
        return ApiResponse.<ReceiptResponse>builder()
                .data(receiptService.completeReceipt(id))
                .message(messageUtil.getMessage("receipt.completed.success"))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<ReceiptResponse>> getAll() {
        return ApiResponse.<List<ReceiptResponse>>builder()
                .data(receiptService.getAllReceipts())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ReceiptResponse> getById(@PathVariable String id) {
        return ApiResponse.<ReceiptResponse>builder()
                .data(receiptService.getById(id))
                .build();
    }
}