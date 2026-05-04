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
      const url = error.config?.url

      if (status === 401) {
        // CỨU CÁNH Ở ĐÂY: Nếu API gọi đến có chứa chữ 'login' thì bỏ qua, KHÔNG F5 TRANG!
        if (url && (url.includes('/login') || url.includes('/auth/login'))) {
          return Promise.reject(error)
        }

        // Nếu là các API khác (VD: đang xem giỏ hàng mà token hết hạn) thì mới ép văng ra ngoài
        useAuthStore.getState().logout()
      } else if (status === 403) {
        // Lỗi 403 (Forbidden)
      }
    }
    return Promise.reject(error)
  }
)
