package com.haui.vtech.service;

import com.haui.vtech.dto.receipt.SupplierResponse;
import com.haui.vtech.enums.SupplierStatus;
import com.haui.vtech.mapper.ReceiptMapper;
import com.haui.vtech.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final ReceiptMapper receiptMapper;

    @Override
    public List<SupplierResponse> getAllActiveSuppliers() {
        return supplierRepository.findByStatus(SupplierStatus.ACTIVE).stream().map(receiptMapper::toSupplierResponse).toList();
    }
}
