import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { logInSchema } from '@/components/auth/schemas/schemas'
import type { AuthResponse } from '@/services/auth/auth.type'
import type z from 'zod'

type LogInPayload = z.infer<typeof logInSchema>

export const loginApi = async (payload: LogInPayload) => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return res.data
}
