import type { ApiResponse } from '@/defines/apiResponse'
import type {
  ExcelPreviewResponse,
  ReceiptRequest,
  ReceiptResponse,
  SupplierResponse
} from './receipt.type'
import { api } from '@/utils/axiosCustomize'

// --- SUPPLIER ---
export const getAllSuppliersApi = async () => {
  // Giả định bạn có endpoint này ở backend
  const res = await api.get<ApiResponse<SupplierResponse[]>>('/suppliers')
  return res.data.data
}

// --- RECEIPT ---
export const getAllReceiptsApi = async () => {
  const res = await api.get<ApiResponse<ReceiptResponse[]>>('/inventory-receipts')
  return res.data.data
}

export const getReceiptByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<ReceiptResponse>>(`/inventory-receipts/${id}`)
  return res.data.data
}

export const createManualReceiptApi = async (payload: ReceiptRequest) => {
  const res = await api.post<ApiResponse<ReceiptResponse>>('/inventory-receipts', payload)
  return res.data
}

export const completeReceiptApi = async (id: string) => {
  const res = await api.patch<ApiResponse<ReceiptResponse>>(`/inventory-receipts/${id}/complete`)
  return res.data
}

export const cancelReceiptApi = async (id: string) => {
  const res = await api.patch<ApiResponse<ReceiptResponse>>(`/inventory-receipts/${id}/cancel`)
  return res.data
}

// --- EXCEL IMPORT PREVIEW ---
export const previewExcelReceiptApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<ApiResponse<ExcelPreviewResponse[]>>(
    '/inventory-receipts/import-preview',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
  return res.data.data
}
