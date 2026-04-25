import type { ApiResponse } from '@/defines/apiResponse'
import type {
  ProductVariantPayload,
  ProductVariantResponse
} from '@/services/product-variant/variant.type'
import { api } from '@/utils/axiosCustomize'

export const getVariantsByProductIdApi = async (productId: string) => {
  const res = await api.get<ApiResponse<ProductVariantResponse[]>>(
    `/product-variants/product/${productId}`
  )
  return res.data.data
}

export const getVariantByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<ProductVariantResponse>>(`/product-variants/${id}`)
  return res.data.data
}

// Hàm hỗ trợ build FormData chuẩn cho Backend
const buildVariantFormData = (payload: ProductVariantPayload) => {
  const formData = new FormData()

  // Tách image ra khỏi payload data gốc
  const { image, ...variantData } = payload

  // Chuyển JSON thành Blob có type chuẩn để SpringBoot xử lý @RequestPart("data")
  formData.append('data', new Blob([JSON.stringify(variantData)], { type: 'application/json' }))

  // Append ảnh nếu có
  if (image) {
    formData.append('image', image)
  }

  return formData
}

export const createVariantApi = async (payload: ProductVariantPayload) => {
  const formData = buildVariantFormData(payload)
  const res = await api.post<ApiResponse<ProductVariantResponse>>('/product-variants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const updateVariantApi = async (id: string, payload: ProductVariantPayload) => {
  const formData = buildVariantFormData(payload)
  const res = await api.put<ApiResponse<ProductVariantResponse>>(
    `/product-variants/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
  return res.data
}

export const deleteVariantApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/product-variants/${id}`)
  return res.data
}
