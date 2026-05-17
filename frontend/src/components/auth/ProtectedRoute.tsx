import { useAuthStore } from '@/store/auth.store'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export default function ProtectedRoute({
  allowedRoles = ['ROLE_ADMIN', 'ROLE_STAFF']
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // 1. Nếu chưa đăng nhập -> Đá về trang /login
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  // 2. Nếu có truyền allowedRoles vào -> Kiểm tra xem user có ít nhất 1 role hợp lệ không
  if (allowedRoles.length > 0) {
    const hasAccess = user?.roles?.some((role) => allowedRoles.includes(role))

    if (!hasAccess) {
      toast.error('Bạn không có quyền truy cập trang này!')
      // Đá về trang dashboard nếu đã ở trong admin, hoặc trang chủ nếu ở ngoài
      return <Navigate to='/dashboard/orders' replace />
    }
  }

  // 3. Hợp lệ -> Cho phép render giao diện bên trong
  return <Outlet />
}
