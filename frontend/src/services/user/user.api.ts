import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { UpdateUserRequest, UpdateUserResponse, UserResponse } from '@/services/user/user.type'

export const getAllUsersApi = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>('/users')
  return res.data.data
}

export const updateUserApi = async (userId: string, payload: UpdateUserRequest) => {
  const res = await api.put<ApiResponse<UpdateUserResponse>>(`/users/${userId}`, payload)
  return res.data.data
}

export const deleteUserApi = async (userId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/${userId}`)
  return res.data
}
