import type { UserStatus } from '@/defines/enum/user.enum'
import type { MemberTier } from '@/services/vpoint/vpoint.type'

export interface UserResponse {
  id: string
  username: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
  roles: string[]

  gender: string
  dob?: string | null
  currentVpoint: number
  totalVpoint: number
  memberTier: MemberTier

  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type UpdateUserRequest = {
  username: string
  fullName?: string | null
  phone?: string | null
  avatar?: File | null
  status: UserStatus
  roles?: string[]
}

export type UpdateUserResponse = {
  id: string
  username: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
}

export type SignUpRequest = {
  username: string
  email: string
  password: string
  fullName: string // THÊM MỚI
  phone: string // THÊM MỚI
  dob: string // THÊM MỚI (định dạng YYYY-MM-DD)
  gender: string // THÊM MỚI (MALE, FEMALE, OTHER)
}

export type ChangePasswordRequest = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export type VerifyOtpRequest = { email: string; otpCode: string }
export type ResendOtpRequest = { email: string }

export type ForgotPasswordRequest = { email: string }

export type ResetPasswordRequest = {
  email: string
  otpCode: string
  newPassword: string
  confirmPassword: string
}

export type UpdateMyProfileRequest = {
  username: string
  fullName: string
  phone: string
  gender: string
  avatar?: File | null
}
