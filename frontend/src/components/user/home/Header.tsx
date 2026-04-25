import { useState, useRef, useEffect } from 'react'
import {
  Search,
  MapPin,
  ShoppingCart,
  User,
  Menu,
  Home,
  Package,
  Bell,
  Gift,
  History,
  ReceiptText,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LanguageSelector from '@/components/common/LanguageSelector'
import { useCart } from '@/contexts/CartContext'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store' // Import auth store

export function Header() {
  const { t } = useTranslation('common')
  const { cart } = useCart()
  const totalCount = cart?.totalQuantity || 0

  // --- LẤY STATE TỪ ZUSTAND ---
  const { isAuthenticated, user, logout } = useAuthStore()

  // Tuỳ thuộc vào payload JWT của bạn lưu tên ở field nào (name, sub, username...)
  // Ở đây tôi lấy user.sub làm ví dụ, fallback về 'Tài khoản'
  const userName = user?.sub || 'Tài khoản'

  // --- LOGIC MENU DROPDOWN ---
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    logout() // Gọi hàm logout từ Zustand
  }

  return (
    <header className='sticky top-0 z-50 bg-primary text-primary-foreground shadow-md'>
      <div className='container mx-auto px-3 sm:px-4 max-w-7xl'>
        <div className='flex h-14 items-center gap-2 sm:gap-4 lg:h-16'>
          {/* Mobile menu */}
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground h-9 w-9'
          >
            <Menu className='h-5 w-5' />
          </Button>

          {/* Logo */}
          <Link to='/' className='flex items-center gap-1 shrink-0'>
            <span className='text-xl sm:text-3xl font-extrabold tracking-tight'>
              V<span className='text-white/90'>Tech</span>
            </span>
          </Link>

          {/* Search */}
          <div className='flex-1 max-w-2xl mx-2 sm:mx-6'>
            <div className='relative group'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
              <Input
                type='search'
                placeholder={t('header.searchPlaceholder')}
                className='h-10 pl-10 pr-4 bg-white text-foreground border-0 rounded-full shadow-inner focus-visible:ring-2 focus-visible:ring-white/50 placeholder:text-muted-foreground transition-all'
              />
            </div>
          </div>

          {/* Right actions */}
          <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
            <div className='hidden xl:block'>
              <LanguageSelector />
            </div>

            {/* Nút Giỏ hàng */}
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='relative h-10 gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-3 rounded-full'
            >
              <Link to='/cart'>
                <ShoppingCart className='h-5 w-5' />
                {totalCount > 0 && (
                  <Badge className='absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 flex items-center justify-center bg-white text-primary text-[10px] font-bold rounded-full shadow-sm pointer-events-none'>
                    {totalCount}
                  </Badge>
                )}
                <span className='hidden lg:inline text-xs font-medium'>{t('header.cart')}</span>
              </Link>
            </Button>

            {/* KHU VỰC TÀI KHOẢN & DROPDOWN */}
            {isAuthenticated ? (
              <div className='relative' ref={userMenuRef}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'h-10 gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-3 rounded-full transition-colors',
                    isUserMenuOpen && 'bg-white/10'
                  )}
                >
                  <User className='h-5 w-5' />
                  <span className='hidden lg:inline text-xs font-medium truncate max-w-[100px]'>
                    {userName}
                  </span>
                </Button>

                {/* Menu thả xuống */}
                {isUserMenuOpen && (
                  <div className='absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2'>
                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/profile'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <Home className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Tổng quan</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/orders'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <Package className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Đơn hàng của tôi</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/notifications'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <Bell className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Thông báo của tôi</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/offers'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <Gift className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Ưu đãi của tôi</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/rewards'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <History className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Lịch sử điểm thưởng</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/services'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <ReceiptText className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Dịch vụ thu hộ</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/warranty'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <ShieldCheck className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Thông tin bảo hành</span>
                    </Link>

                    <Link
                      onClick={() => setIsUserMenuOpen(false)}
                      to='/addresses'
                      className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors'
                    >
                      <MapPin className='h-5 w-5 text-slate-600' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Sổ địa chỉ nhận hàng</span>
                    </Link>

                    <div className='my-1 border-t border-slate-100'></div>

                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left text-red-600'
                    >
                      <LogOut className='h-5 w-5' strokeWidth={1.5} />
                      <span className='text-[15px] font-medium'>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='h-10 gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-3 rounded-full'
              >
                <Link to='/login'>
                  <User className='h-5 w-5' />
                  <span className='hidden lg:inline text-xs font-medium'>{t('header.login')}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
