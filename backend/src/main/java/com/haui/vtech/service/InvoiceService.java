package com.haui.vtech.service;

public interface InvoiceService {
    byte[] generateInvoicePdf(String orderId);
}