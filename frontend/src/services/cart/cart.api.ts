import { api } from '@/utils/axiosCustomize'
import type { CartResponse, CartItemRequest } from './cart.type'
import type { ApiResponse } from '@/defines/apiResponse'

export const getMyCartApi = async (): Promise<CartResponse> => {
  const res = await api.get<ApiResponse<CartResponse>>('/client/cart')
  return res.data.data
}

export const addToCartApi = async (data: CartItemRequest): Promise<CartResponse> => {
  const res = await api.post<ApiResponse<CartResponse>>('/client/cart/add', data)
  return res.data.data
}

export const updateCartItemApi = async (
  cartDetailId: string,
  quantity: number
): Promise<CartResponse> => {
  // quantity ở backend là @RequestParam nên truyền qua params
  const res = await api.put<ApiResponse<CartResponse>>(
    `/client/cart/update/${cartDetailId}`,
    null,
    {
      params: { quantity }
    }
  )
  return res.data.data
}

export const removeCartItemApi = async (cartDetailId: string): Promise<CartResponse> => {
  const res = await api.delete<ApiResponse<CartResponse>>(`/client/cart/remove/${cartDetailId}`)
  return res.data.data
}

export const clearCartApi = async (): Promise<void> => {
  await api.delete('/client/cart/clear')
}
