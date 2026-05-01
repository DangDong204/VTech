import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  SignUpRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  UserResponse
} from '@/services/user/user.type'

export const getAllUsersApi = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>('/users')
  return res.data.data
}

export const updateUserApi = async (userId: string, payload: UpdateUserRequest) => {
  const formData = new FormData()

  formData.append('username', payload.username)

  if (payload.fullName) formData.append('fullName', payload.fullName)
  if (payload.phone) formData.append('phone', payload.phone)

  formData.append('status', payload.status)

  payload.roles?.forEach((role) => formData.append('roles', role))

  if (payload.avatar) formData.append('file', payload.avatar)

  const res = await api.put<ApiResponse<UpdateUserResponse>>(`/users/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data.data
}

export const deleteSoftUserApi = async (userId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/${userId}`)
  return res.data
}

export const getAllUserInTrashApi = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>(`/users/trash`)
  return res.data.data
}

export const restoreUserApi = async (userId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/users/trash/${userId}`)
  return res.data
}

export const deleteHardUserApi = async (userId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/trash/${userId}`)
  return res.data
}

export const signUpApi = async (data: SignUpRequest) => {
  const res = await api.post<ApiResponse<UserResponse>>('/auth/register', data)
  return res.data
}

// Get My-Info
export const getMyProfileApi = async (): Promise<UserResponse> => {
  const res = await api.get<ApiResponse<UserResponse>>('/users/my-profile')
  return res.data.data
}
