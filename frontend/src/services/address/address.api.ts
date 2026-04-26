import { api } from '@/utils/axiosCustomize'
import type { AddressRequest, AddressResponse } from './address.type'
import type { ApiResponse } from '@/defines/apiResponse'

export const getMyAddressesApi = async (): Promise<AddressResponse[]> => {
  const res = await api.get<ApiResponse<AddressResponse[]>>('/client/addresses')
  return res.data.data
}

export const createAddressApi = async (data: AddressRequest): Promise<AddressResponse> => {
  const res = await api.post<ApiResponse<AddressResponse>>('/client/addresses', data)
  return res.data.data
}

export const updateAddressApi = async (
  id: string,
  data: AddressRequest
): Promise<AddressResponse> => {
  const res = await api.put<ApiResponse<AddressResponse>>(`/client/addresses/${id}`, data)
  return res.data.data
}

export const setDefaultAddressApi = async (id: string): Promise<void> => {
  await api.patch(`/client/addresses/${id}/default`)
}

export const deleteAddressApi = async (id: string): Promise<void> => {
  await api.delete(`/client/addresses/${id}`)
}
