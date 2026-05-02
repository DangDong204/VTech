import { cn } from '@/lib/utils'
import { getMyOrdersApi } from '@/services/order/order.api'
import { getMyProfileApi } from '@/services/user/user.api'
import { getMyVouchersApi } from '@/services/voucher/voucher.api' // BỔ SUNG IMPORT NÀY
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Gift, History, Home, KeyRound, LogOut, MapPin, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function ProfileLayout() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()

  // Lấy data User để hiển thị lên Layout
  const { data: user, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfileApi
  })

  // BỔ SUNG: Lấy data Voucher để đếm số lượng
  const { data: vouchers = [] } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: getMyVouchersApi
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrdersApi
  })

  const ordersProcessing = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.orderStatus)
  ).length

  // Danh sách menu đồng bộ với Header
  const menuItems = [
    { path: '/profile', icon: Home, label: t('profile.overview', 'Tổng quan') },
    { path: '/orders', icon: Package, label: t('profile.orders', 'Đơn hàng của tôi') },
    { path: '/offers', icon: Gift, label: t('profile.offers', 'Ưu đãi của tôi') },
    { path: '/rewards', icon: History, label: t('profile.rewards', 'Lịch sử điểm thưởng') },
    { path: '/addresses', icon: MapPin, label: t('profile.addresses', 'Sổ địa chỉ nhận hàng') },
    { path: '/change-password', icon: KeyRound, label: t('profile.changePassword', 'Đổi mật khẩu') }
  ]

  const handleLogout = () => {
    // Xử lý logic logout ở đây
    navigate('/login')
  }

  const displayName = user?.fullName || user?.username || 'Khách hàng'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className='bg-slate-50 min-h-screen pb-12 pt-4'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* BREADCRUMB */}
        <nav className='flex items-center text-sm text-muted-foreground mb-6 pb-4 border-b border-slate-200'>
          <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
            <Home className='h-4 w-4 mb-0.5' />
            <span className='hidden sm:inline'>{t('nav.home', 'Trang chủ')}</span>
          </Link>
          <ChevronRight className='h-4 w-4 mx-2 shrink-0 opacity-50' />
          <span className='text-foreground font-medium'>
            {t('profile.title', 'Tài khoản của tôi')}
          </span>
        </nav>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start'>
          {/* CỘT TRÁI: SIDEBAR */}
          <div className='lg:col-span-1 bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden sticky top-20'>
            {/* Thông tin User tóm tắt */}
            <div className='p-4 border-b border-slate-100 flex items-center gap-3'>
              {isLoading ? (
                <div className='h-12 w-12 rounded-full bg-slate-200 animate-pulse shrink-0' />
              ) : user?.avatar ? (
                <img
                  src={user.avatar}
                  alt='avatar'
                  className='h-12 w-12 rounded-full object-cover border border-slate-200 shrink-0'
                />
              ) : (
                <div className='h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg shrink-0'>
                  {initial}
                </div>
              )}

              <div className='flex flex-col min-w-0'>
                <span className='text-xs text-muted-foreground'>
                  {t('profile.greeting', 'Xin chào')},
                </span>

                {isLoading ? (
                  <div className='h-4 w-24 bg-slate-200 animate-pulse rounded mt-1' />
                ) : (
                  <span className='text-sm font-bold text-slate-800 truncate'>{displayName}</span>
                )}
              </div>
            </div>

            {/* Menu Links */}
            <nav className='p-2 flex flex-col gap-1'>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                const isOffers = item.path === '/offers' // Kiểm tra xem có phải tab Ưu đãi không
                const isOrders = item.path === '/orders' // Kiểm tra xem có phải tab Đơn hàng không

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 rounded-lg text-[15px] transition-all',
                      isActive
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-red-600 font-medium'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <item.icon className='h-5 w-5' strokeWidth={isActive ? 2 : 1.5} />
                      {item.label}
                    </div>

                    {/* HIỂN THỊ SỐ LƯỢNG VOUCHER (Màu đỏ) */}
                    {isOffers && vouchers.length > 0 && (
                      <span className='bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold'>
                        {vouchers.length}
                      </span>
                    )}

                    {/* HIỂN THỊ THÔNG BÁO SỐ ĐƠN ĐANG XỬ LÝ (Màu xanh) */}
                    {isOrders && ordersProcessing > 0 && (
                      <span className='bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold'>
                        {ordersProcessing}
                      </span>
                    )}
                  </Link>
                )
              })}

              <div className='my-1 mx-4 border-t border-slate-100'></div>

              <button
                onClick={handleLogout}
                className='flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] font-medium text-red-600 hover:bg-red-50 transition-all text-left'
              >
                <LogOut className='h-5 w-5' strokeWidth={1.5} />
                {t('profile.logout', 'Đăng xuất')}
              </button>
            </nav>
          </div>

          {/* CỘT PHẢI: NỘI DUNG (Được thay đổi thông qua Outlet) */}
          <div className='lg:col-span-3 min-w-0'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
