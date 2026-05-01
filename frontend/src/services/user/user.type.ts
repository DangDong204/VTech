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
}
