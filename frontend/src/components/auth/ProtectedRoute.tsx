import { useAuthStore } from '@/store/auth.store'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'sonner'

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore()

  // 1. Nếu chưa đăng nhập -> Đá về trang /login
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  // 2. Kiểm tra Role (Chỉ ADMIN hoặc STAFF mới được vào Dashboard)
  const hasAccess = user?.roles?.some((role) => ['ROLE_ADMIN', 'ROLE_STAFF'].includes(role))

  if (!hasAccess) {
    // Có thể bạn sẽ tạo 1 trang 403.tsx riêng, ở đây tạm thời đá về trang chủ hoặc thông báo
    toast.error('Bạn không có quyền truy cập trang quản trị!')
    return <Navigate to='/login' replace />
  }

  // 3. Hợp lệ -> Cho phép render giao diện bên trong
  return <Outlet />
}
