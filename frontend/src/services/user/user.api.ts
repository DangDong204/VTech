import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SignUpRequest,
  UpdateMyProfileRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  UserResponse,
  VerifyOtpRequest
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

// Change password
export const changePasswordApi = async (data: ChangePasswordRequest) => {
  const res = await api.put<ApiResponse<void>>('/users/change-password', data)
  return res.data
}

export const verifyOtpApi = async (data: VerifyOtpRequest) => {
  const res = await api.post<ApiResponse<void>>('/auth/verify-otp', data)
  return res.data
}

export const resendOtpApi = async (data: ResendOtpRequest) => {
  const res = await api.post<ApiResponse<void>>('/auth/resend-otp', data)
  return res.data
}

export const forgotPasswordApi = async (data: ForgotPasswordRequest) => {
  const res = await api.post<ApiResponse<void>>('/auth/forgot-password', data)
  return res.data
}

export const resetPasswordApi = async (data: ResetPasswordRequest) => {
  const res = await api.post<ApiResponse<void>>('/auth/reset-password', data)
  return res.data
}

export const updateMyProfileApi = async (payload: UpdateMyProfileRequest) => {
  const formData = new FormData()

  formData.append('username', payload.username)
  formData.append('fullName', payload.fullName)
  formData.append('phone', payload.phone)
  formData.append('gender', payload.gender)

  if (payload.avatar) {
    formData.append('file', payload.avatar)
  }

  const res = await api.put<ApiResponse<UpdateUserResponse>>('/users/my-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}
