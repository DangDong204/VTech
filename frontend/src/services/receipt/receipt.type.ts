import type { ReceiptStatus, SupplierStatus } from '@/defines/enum/receipt.enum'

export interface SupplierResponse {
  id: string
  supplierName: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  status: SupplierStatus
}

export interface ReceiptDetailResponse {
  id: string
  variantId: string
  sku: string
  productName: string
  versionName: string
  colorName: string
  quantity: number
  importPrice: number
  totalPrice: number
}

export interface ReceiptResponse {
  id: string
  receiptCode: string
  supplierId?: string
  supplierName?: string
  totalAmount: number
  note?: string
  status: ReceiptStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  details: ReceiptDetailResponse[]
}

export interface ReceiptDetailRequest {
  variantId: string
  quantity: number
  importPrice: number
}

export interface ReceiptRequest {
  supplierId?: string
  note?: string
  details: ReceiptDetailRequest[]
}

// Type dành riêng cho tính năng Preview Excel
export interface ExcelPreviewResponse {
  rowIndex: number
  sku: string
  productName?: string
  variantId?: string
  quantity: number
  importPrice: number
  isValid: boolean
  errors: string[]
}
