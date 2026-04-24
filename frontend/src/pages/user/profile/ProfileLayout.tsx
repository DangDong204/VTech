import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Package,
  Bell,
  Gift,
  History,
  ReceiptText,
  ShieldCheck,
  MapPin,
  LogOut,
  ChevronRight,
  KeyRound
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function ProfileLayout() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()

  // Danh sách menu đồng bộ với Header
  const menuItems = [
    { path: '/profile', icon: Home, label: t('profile.overview', 'Tổng quan') },
    { path: '/orders', icon: Package, label: t('profile.orders', 'Đơn hàng của tôi') },
    { path: '/notifications', icon: Bell, label: t('profile.notifications', 'Thông báo của tôi') },
    { path: '/offers', icon: Gift, label: t('profile.offers', 'Ưu đãi của tôi') },
    { path: '/rewards', icon: History, label: t('profile.rewards', 'Lịch sử điểm thưởng') },
    { path: '/services', icon: ReceiptText, label: t('profile.services', 'Dịch vụ thu hộ') },
    { path: '/warranty', icon: ShieldCheck, label: t('profile.warranty', 'Thông tin bảo hành') },
    { path: '/addresses', icon: MapPin, label: t('profile.addresses', 'Sổ địa chỉ nhận hàng') },
    { path: '/change-password', icon: KeyRound, label: t('profile.changePassword', 'Đổi mật khẩu') }
  ]

  const handleLogout = () => {
    // Xử lý logic logout ở đây
    navigate('/login')
  }

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
              <div className='h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0'>
                Đ
              </div>
              <div className='flex flex-col min-w-0'>
                <span className='text-xs text-muted-foreground'>
                  {t('profile.greeting', 'Xin chào')},
                </span>
                <span className='text-sm font-bold text-slate-800 truncate'>Nguyễn Đăng Đông</span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className='p-2 flex flex-col gap-1'>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] transition-all',
                      isActive
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-red-600 font-medium'
                    )}
                  >
                    <item.icon className='h-5 w-5' strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
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
