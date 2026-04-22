package com.haui.vtech.service;

import com.haui.vtech.dto.receipt.SupplierResponse;

import java.util.List;

public interface SupplierService {

    List<SupplierResponse> getAllActiveSuppliers();

}
