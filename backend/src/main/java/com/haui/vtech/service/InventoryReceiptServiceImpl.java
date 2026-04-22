package com.haui.vtech.service;

import com.haui.vtech.dto.receipt.ExcelPreviewResponse;
import com.haui.vtech.dto.receipt.ReceiptDetailRequest;
import com.haui.vtech.dto.receipt.ReceiptRequest;
import com.haui.vtech.dto.receipt.ReceiptResponse;
import com.haui.vtech.entity.InventoryReceiptDetailEntity;
import com.haui.vtech.entity.InventoryReceiptEntity;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.SupplierEntity;
import com.haui.vtech.enums.ReceiptStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ReceiptMapper;
import com.haui.vtech.repository.InventoryReceiptRepository;
import com.haui.vtech.repository.ProductVariantRepository;
import com.haui.vtech.repository.SupplierRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryReceiptServiceImpl implements InventoryReceiptService {

    private final InventoryReceiptRepository receiptRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository variantRepository;
    private final ReceiptMapper receiptMapper;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public ReceiptResponse createManual(ReceiptRequest request, String username) {
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.RECEIPT_DETAIL_EMPTY);
        }

        InventoryReceiptEntity receipt = buildBaseReceipt(request.getSupplierId(), request.getNote(), username);
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ReceiptDetailRequest detailReq : request.getDetails()) {
            ProductVariantEntity variant = variantRepository.findById(detailReq.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detailReq.getVariantId()));

            InventoryReceiptDetailEntity detailEntity = InventoryReceiptDetailEntity.builder()
                    .receipt(receipt)
                    .variant(variant)
                    .quantity(detailReq.getQuantity())
                    .importPrice(detailReq.getImportPrice())
                    .build();
            detailEntity.calculateTotal(); // Tính totalPrice
            receipt.getDetails().add(detailEntity);
            totalAmount = totalAmount.add(detailEntity.getTotalPrice());
        }

        receipt.setTotalAmount(totalAmount);
        InventoryReceiptEntity saved = receiptRepository.saveAndFlush(receipt);
        entityManager.refresh(saved); // ← Reload từ DB, lúc này createdAt có giá trị

        return receiptMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ReceiptResponse importFromExcel(MultipartFile file, String supplierId, String note, String username) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.EXCEL_INVALID_FORMAT);
        }

        InventoryReceiptEntity receipt = buildBaseReceipt(supplierId, note, username);
        BigDecimal totalAmount = BigDecimal.ZERO;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Duyệt từ dòng 1 (Bỏ qua dòng 0 là tiêu đề cột)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // TRY-CATCH CỤC BỘ: Nếu dòng này lỗi, ghi log và bỏ qua, chạy tiếp dòng sau
                try {
                    String sku = getCellStringValue(row.getCell(0));
                    if (sku == null || sku.isBlank()) continue;

                    int quantity = (int) row.getCell(1).getNumericCellValue();
                    BigDecimal importPrice = BigDecimal.valueOf(row.getCell(2).getNumericCellValue());

                    if (quantity <= 0 || importPrice.compareTo(BigDecimal.ZERO) < 0) {
                        continue; // Bỏ qua dữ liệu âm
                    }

                    ProductVariantEntity variant = variantRepository.findBySkuIn(List.of(sku))
                            .stream().findFirst()
                            .orElse(null);

                    if (variant == null) {
                        log.warn("Bỏ qua dòng {}: Không tìm thấy SKU '{}' trong hệ thống.", i + 1, sku);
                        continue; // Bỏ qua nếu SKU sai
                    }

                    InventoryReceiptDetailEntity detailEntity = InventoryReceiptDetailEntity.builder()
                            .receipt(receipt)
                            .variant(variant)
                            .quantity(quantity)
                            .importPrice(importPrice)
                            .build();
                    detailEntity.calculateTotal();

                    receipt.getDetails().add(detailEntity);
                    totalAmount = totalAmount.add(detailEntity.getTotalPrice());

                } catch (Exception ex) {
                    log.warn("Lỗi định dạng tại dòng {}. Đã bỏ qua dòng này.", i + 1);
                }
            }

            // Nếu đọc xong file mà không có dòng nào hợp lệ
            if (receipt.getDetails().isEmpty()) {
                throw new AppException(ErrorCode.RECEIPT_DETAIL_EMPTY);
            }

            receipt.setTotalAmount(totalAmount);
            InventoryReceiptEntity saved = receiptRepository.saveAndFlush(receipt);
            entityManager.refresh(saved); // Load lại để nhận created_at, updated_at

            return receiptMapper.toResponse(saved);

        } catch (AppException e) {
            throw e; // Ném lại các lỗi nghiệp vụ (như RECEIPT_DETAIL_EMPTY)
        } catch (Exception e) {
            log.error("Lỗi đọc file Excel", e);
            throw new AppException(ErrorCode.EXCEL_READ_ERROR);
        }
    }

    @Override
    @Transactional
    public ReceiptResponse completeReceipt(String id) {
        InventoryReceiptEntity receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.PENDING) {
            throw new AppException(ErrorCode.RECEIPT_NOT_PENDING);
        }

        // Lặp qua chi tiết để cộng tồn kho
        for (InventoryReceiptDetailEntity detail : receipt.getDetails()) {
            ProductVariantEntity variant = detail.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
            variantRepository.save(variant); // Lưu lại lượng tồn mới
        }

        // Chuyển trạng thái
        receipt.setStatus(ReceiptStatus.COMPLETED);
        return receiptMapper.toResponse(receiptRepository.save(receipt));
    }

    @Override
    @Transactional
    public ReceiptResponse cancelReceipt(String id) {
        InventoryReceiptEntity receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.PENDING) {
            throw new AppException(ErrorCode.RECEIPT_NOT_PENDING);
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        return receiptMapper.toResponse(receiptRepository.save(receipt));
    }

    @Override
    public List<ExcelPreviewResponse> previewExcelData(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.EXCEL_INVALID_FORMAT);
        }

        List<ExcelPreviewResponse> previewList = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String sku = null;
                Integer quantity = null;
                BigDecimal importPrice = null;
                boolean isValid = true;
                List<String> errors = new ArrayList<>();
                String productName = null;
                String variantId = null;

                try {
                    // 1. Đọc SKU
                    sku = getCellStringValue(row.getCell(0));
                    if (sku == null || sku.isBlank()) {
                        isValid = false;
                        errors.add("SKU không được để trống");
                    }

                    // 2. Đọc Số lượng
                    try {
                        quantity = (int) row.getCell(1).getNumericCellValue();
                        if (quantity <= 0) {
                            isValid = false;
                            errors.add("Số lượng phải là số > 0");
                        }
                    } catch (Exception e) {
                        isValid = false;
                        errors.add("Số lượng sai định dạng");
                    }

                    // 3. Đọc Giá nhập
                    try {
                        importPrice = BigDecimal.valueOf(row.getCell(2).getNumericCellValue());
                        if (importPrice.compareTo(BigDecimal.ZERO) < 0) {
                            isValid = false;
                            errors.add("Giá nhập không được âm");
                        }
                    } catch (Exception e) {
                        isValid = false;
                        errors.add("Giá nhập sai định dạng");
                    }

                    // 4. Validate DB nếu các định dạng trên đúng
                    if (isValid && sku != null) {
                        ProductVariantEntity variant = variantRepository.findBySkuIn(List.of(sku))
                                .stream().findFirst()
                                .orElse(null);

                        if (variant == null) {
                            isValid = false;
                            errors.add("Mã SKU không tồn tại trong hệ thống");
                        } else {
                            variantId = variant.getId();
                            productName = variant.getProduct().getProductName() + " - " + variant.getVersion().getVersionName() + " (" + variant.getColor().getColorName() + ")";
                        }
                    }

                } catch (Exception ex) {
                    isValid = false;
                    errors.add("Lỗi không xác định khi đọc dòng");
                }

                // Build object trả về
                previewList.add(ExcelPreviewResponse.builder()
                        .rowIndex(i + 1)
                        .sku(sku)
                        .quantity(quantity != null ? quantity : 0)
                        .importPrice(importPrice != null ? importPrice : BigDecimal.ZERO)
                        .isValid(isValid)
                        .errors(errors)
                        .productName(productName)
                        .variantId(variantId)
                        .build());
            }

            return previewList;

        } catch (Exception e) {
            log.error("Lỗi đọc file Excel Preview", e);
            throw new AppException(ErrorCode.EXCEL_READ_ERROR);
        }
    }

    @Override
    public List<ReceiptResponse> getAllReceipts() {
        return receiptRepository.findAllByOrderByIdDesc().stream().map(receiptMapper::toResponse).toList();
    }

    @Override
    public ReceiptResponse getById(String id) {
        return receiptRepository.findById(id).map(receiptMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));
    }

    private InventoryReceiptEntity buildBaseReceipt(String supplierId, String note, String username) {
        SupplierEntity supplier = null;
        if (supplierId != null && !supplierId.isBlank()) {
            supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        }

        // Tạo mã phiếu tự động: PN-20260422-xxxx
        String code = "PN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));

        return InventoryReceiptEntity.builder()
                .receiptCode(code)
                .supplier(supplier)
                .note(note)
                .createdBy(username)
                .status(ReceiptStatus.PENDING)
                .details(new ArrayList<>())
                .build();
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        return null;
    }
}
