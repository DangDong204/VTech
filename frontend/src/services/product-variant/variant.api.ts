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

export const createVariantApi = async (payload: ProductVariantPayload) => {
  const res = await api.post<ApiResponse<ProductVariantResponse>>('/product-variants', payload)
  return res.data
}

export const updateVariantApi = async (id: string, payload: ProductVariantPayload) => {
  const res = await api.put<ApiResponse<ProductVariantResponse>>(`/product-variants/${id}`, payload)
  return res.data
}

export const deleteVariantApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/product-variants/${id}`)
  return res.data
}
