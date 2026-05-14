import LanguageSelector from '@/components/common/LanguageSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  Gift,
  History,
  Home,
  KeyRound,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  User
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getMyOrdersApi } from '@/services/order/order.api'
import { getMyVouchersApi } from '@/services/voucher/voucher.api'
import { useQuery } from '@tanstack/react-query'

export function Header() {
  const { t } = useTranslation('common')
  const { cart } = useCart()
  const totalCount = cart?.totalQuantity || 0

  const { isAuthenticated, user, logout } = useAuthStore()
  // Sử dụng i18n cho tên mặc định
  const userName = user?.sub || t('header.account', 'Tài khoản')

  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const { data: vouchers = [] } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: getMyVouchersApi,
    enabled: isAuthenticated
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrdersApi,
    enabled: isAuthenticated
  })

  const ordersProcessing = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.orderStatus)
  ).length

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
    logout()
  }

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setShowLoginDialog(true)
    }
  }

  const menuItemClass =
    'flex items-center justify-between px-4 py-2.5 rounded-lg text-[15px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group'
  const iconClass = 'h-5 w-5 text-slate-500 group-hover:text-red-600 transition-colors'

  return (
    <>
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
                className='relative h-10 gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-3 rounded-full cursor-pointer'
              >
                <Link to='/cart' onClick={handleCartClick}>
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
                    <div className='absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 flex flex-col gap-1'>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/profile'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <Home className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.overview', 'Tổng quan')}</span>
                        </div>
                      </Link>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/orders'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <Package className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.orders', 'Đơn hàng của tôi')}</span>
                        </div>
                        {ordersProcessing > 0 && (
                          <span className='bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold'>
                            {ordersProcessing}
                          </span>
                        )}
                      </Link>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/offers'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <Gift className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.offers', 'Ưu đãi của tôi')}</span>
                        </div>
                        {vouchers.length > 0 && (
                          <span className='bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold'>
                            {vouchers.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/rewards'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <History className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.rewards', 'Lịch sử điểm thưởng')}</span>
                        </div>
                      </Link>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/addresses'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <MapPin className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.addresses', 'Sổ địa chỉ nhận hàng')}</span>
                        </div>
                      </Link>
                      <Link
                        onClick={() => setIsUserMenuOpen(false)}
                        to='/change-password'
                        className={menuItemClass}
                      >
                        <div className='flex items-center gap-3'>
                          <KeyRound className={iconClass} strokeWidth={1.5} />
                          <span>{t('profile.changePassword', 'Đổi mật khẩu')}</span>
                        </div>
                      </Link>
                      <div className='my-1 mx-2 border-t border-slate-100'></div>
                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600 font-medium'
                      >
                        <LogOut className='h-5 w-5' strokeWidth={1.5} />
                        <span className='text-[15px]'>{t('nav.logout', 'Đăng xuất')}</span>
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
                    <span className='hidden lg:inline text-xs font-medium'>
                      {t('header.login')}
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- DIALOG YÊU CẦU ĐĂNG NHẬP --- */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold flex items-center gap-2'>
              <div className='bg-primary/10 p-1.5 rounded-full'>
                <ShieldCheck className='w-5 h-5 text-primary' strokeWidth={2.5} />
              </div>
              {t('loginDialog.title', 'VTech')}
            </DialogTitle>
            <DialogDescription className='mt-3 text-slate-600 text-[15px] leading-relaxed'>
              {t(
                'loginDialog.description',
                'Vui lòng đăng nhập tài khoản để sử dụng tính năng giỏ hàng và thanh toán dễ dàng hơn.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-3 mt-4'>
            <Button
              asChild
              variant='outline'
              className='w-full font-medium h-11 transition-colors hover:bg-slate-50'
            >
              <Link
                to='/signup'
                state={{ from: '/cart' }}
                onClick={() => setShowLoginDialog(false)}
              >
                {t('loginDialog.signupBtn', 'Đăng ký mới')}
              </Link>
            </Button>

            <Button
              asChild
              className='w-full bg-primary hover:bg-primary/90 text-white font-medium h-11 transition-colors'
            >
              <Link to='/login' state={{ from: '/cart' }} onClick={() => setShowLoginDialog(false)}>
                {t('loginDialog.loginBtn', 'Đăng nhập ngay')}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
