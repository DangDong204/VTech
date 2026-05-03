import { create } from 'zustand'
import type { JwtPayload } from '@/services/auth/auth.type'

// Hàm tiện ích giải mã JWT (Không cần cài thêm thư viện jwt-decode)
export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  user: JwtPayload | null
  login: (token: string) => void
  logout: () => void
}

const initialToken = localStorage.getItem('access_token')

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!initialToken,
  accessToken: initialToken,
  user: initialToken ? parseJwt(initialToken) : null,

  login: (token: string) => {
    localStorage.setItem('access_token', token)
    set({
      isAuthenticated: true,
      accessToken: token,
      user: parseJwt(token)
    })
  },

  logout: () => {
    // 1. Xóa token phiên đăng nhập
    localStorage.removeItem('access_token')

    // 2. DỌN DẸP SẠCH SẼ BỘ NHỚ CỦA CHATBOT AI
    sessionStorage.removeItem('vtech_chat_messages')
    sessionStorage.removeItem('vtech_chat_session')
    sessionStorage.removeItem('vtech_chat_is_open')
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null
    })
    window.location.href = '/login'
  }
}))
