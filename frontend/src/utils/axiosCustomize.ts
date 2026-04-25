import axios from 'axios'
import { useAuthStore } from '@/store/auth.store' // Đổi đường dẫn theo dự án của bạn

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 1. REQUEST INTERCEPTOR: Can thiệp trước khi gửi API lên server
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 2. RESPONSE INTERCEPTOR: Can thiệp ngay khi server trả kết quả về
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status

      if (status === 401) {
        // Lỗi 401 (Unauthorized): Gọi hàm logout từ Zustand để clear state và redirect
        useAuthStore.getState().logout()
      } else if (status === 403) {
        // Lỗi 403 (Forbidden)
      }
    }
    return Promise.reject(error)
  }
)
