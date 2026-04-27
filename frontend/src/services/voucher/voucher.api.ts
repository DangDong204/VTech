import type { ApiResponse } from '@/defines/apiResponse'
import type { VoucherResponse, VoucherPayload } from './voucher.type'
import { api } from '@/utils/axiosCustomize'

export const getAllVoucherApi = async () => {
  const res = await api.get<ApiResponse<VoucherResponse[]>>('/vouchers')
  return res.data.data
}

export const getVoucherByIdApi = async (voucherId: string) => {
  const res = await api.get<ApiResponse<VoucherResponse>>(`/vouchers/${voucherId}`)
  return res.data.data
}

export const createVoucherApi = async (payload: VoucherPayload) => {
  const res = await api.post<ApiResponse<VoucherResponse>>('/vouchers', payload)
  return res.data
}

export const updateVoucherApi = async (voucherId: string, payload: VoucherPayload) => {
  const res = await api.put<ApiResponse<VoucherResponse>>(`/vouchers/${voucherId}`, payload)
  return res.data
}

export const deleteSoftVoucherApi = async (voucherId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/vouchers/${voucherId}`)
  return res.data
}

export const getAllVoucherInTrashApi = async () => {
  const res = await api.get<ApiResponse<VoucherResponse[]>>('/vouchers/trash')
  return res.data.data
}

export const restoreVoucherApi = async (voucherId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/vouchers/trash/${voucherId}`)
  return res.data
}

export const deleteHardVoucherApi = async (voucherId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/vouchers/trash/${voucherId}`)
  return res.data
}

export const checkVoucherApi = async (payload: {
  voucherCode: string
  subTotal: number
  shippingFee: number
}) => {
  const res = await api.post('/client/vouchers/check', payload)
  return res.data.data
}
