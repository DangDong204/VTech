import { useTranslation } from 'react-i18next'
import { Package, Ticket, Coins, UserCircle, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function OverviewPage() {
  const { t } = useTranslation('common')

  // Mock data (Sau này gọi API lấy thông tin User)
  const userStats = {
    ordersProcessing: 2,
    vouchers: 5,
    points: 1250
  }

  const userInfo = {
    fullName: 'Nguyễn Đăng Đông',
    email: 'dongdang@example.com',
    phone: '0987654321',
    address: 'Kiều Mai, Phúc Diễn, Bắc Từ Liêm, Hà Nội'
  }

  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* Khối Thống kê nhanh */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {/* Box Đơn hàng */}
        <Link
          to='/orders'
          className='bg-white p-5 rounded-xl border border-border/50 shadow-sm flex items-center gap-4 hover:border-red-300 transition-colors group'
        >
          <div className='h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform'>
            <Package className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>
              {t('profile.stats.ordersProcessing', 'Đơn đang xử lý')}
            </p>
            <p className='text-2xl font-bold text-slate-800'>{userStats.ordersProcessing}</p>
          </div>
        </Link>

        {/* Box Voucher */}
        <Link
          to='/offers'
          className='bg-white p-5 rounded-xl border border-border/50 shadow-sm flex items-center gap-4 hover:border-red-300 transition-colors group'
        >
          <div className='h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform'>
            <Ticket className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>
              {t('profile.stats.vouchers', 'Voucher khả dụng')}
            </p>
            <p className='text-2xl font-bold text-slate-800'>{userStats.vouchers}</p>
          </div>
        </Link>

        {/* Box Điểm thưởng */}
        <Link
          to='/rewards'
          className='bg-white p-5 rounded-xl border border-border/50 shadow-sm flex items-center gap-4 hover:border-red-300 transition-colors group'
        >
          <div className='h-12 w-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform'>
            <Coins className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>
              {t('profile.stats.points', 'Điểm V-Point')}
            </p>
            <p className='text-2xl font-bold text-slate-800'>{userStats.points}</p>
          </div>
        </Link>
      </div>

      {/* Khối Thông tin tài khoản */}
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between'>
          <h2 className='text-lg font-bold text-slate-800'>
            {t('profile.accountInfo', 'Thông tin tài khoản')}
          </h2>
          <button className='text-sm font-medium text-blue-600 hover:underline'>Chỉnh sửa</button>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
            <div className='flex gap-3'>
              <UserCircle className='h-5 w-5 text-slate-400 shrink-0 mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Họ và tên</p>
                <p className='font-medium text-slate-800'>{userInfo.fullName}</p>
              </div>
            </div>

            <div className='flex gap-3'>
              <Phone className='h-5 w-5 text-slate-400 shrink-0 mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Số điện thoại</p>
                <p className='font-medium text-slate-800'>{userInfo.phone}</p>
              </div>
            </div>

            <div className='flex gap-3'>
              <Mail className='h-5 w-5 text-slate-400 shrink-0 mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Email</p>
                <p className='font-medium text-slate-800'>{userInfo.email}</p>
              </div>
            </div>

            <div className='flex gap-3'>
              <MapPin className='h-5 w-5 text-slate-400 shrink-0 mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Địa chỉ mặc định</p>
                <p className='font-medium text-slate-800 line-clamp-2'>{userInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
