import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 1. REQUEST INTERCEPTOR: Can thiệp trước khi gửi API lên server
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc nơi bạn dự định lưu)
    const token = localStorage.getItem('access_token')

    // Nếu có token, tự động nhét vào Header Authorization
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
    // Nếu API thành công (Status 2xx), trả nguyên data về cho component
    return response
  },
  (error) => {
    // Nếu API thất bại, xử lý các mã lỗi phổ biến ở đây
    if (error.response) {
      const status = error.response.status

      if (status === 401) {
        // Lỗi 401 (Unauthorized): Token hết hạn hoặc chưa đăng nhập
        // TODO: Xóa token và đá người dùng về trang /login
        localStorage.removeItem('access_token')
        // window.location.href = '/login'
      } else if (status === 403) {
        // Lỗi 403 (Forbidden): Không có quyền truy cập (Ví dụ: USER cố tình gọi API xóa của ADMIN)
      }
    }

    return Promise.reject(error)
  }
)
