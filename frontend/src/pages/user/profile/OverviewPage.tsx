import { getMyOrdersApi } from '@/services/order/order.api'
import { getMyProfileApi } from '@/services/user/user.api'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Coins,
  Mail,
  Calendar,
  Package,
  Phone,
  Ticket,
  UserCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function OverviewPage() {
  const { t } = useTranslation('common')

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfileApi
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrdersApi
  })

  const ordersProcessing = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.orderStatus)
  ).length

  if (isLoadingUser) {
    return (
      <div className='flex items-center justify-center p-16'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin' />
          <p className='text-sm text-slate-500 font-medium'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Hàm format ngày sinh từ YYYY-MM-DD sang DD/MM/YYYY
  const formatDob = (dobString?: string | null) => {
    if (!dobString) return 'Chưa cập nhật'
    try {
      const date = new Date(dobString)
      return new Intl.DateTimeFormat('vi-VN').format(date)
    } catch {
      return dobString
    }
  }

  const stats = [
    {
      to: '/orders',
      icon: <Package className='h-6 w-6' />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accentColor: 'from-blue-400 to-blue-600',
      label: t('profile.stats.ordersProcessing', 'Đơn đang xử lý'),
      value: ordersProcessing,
      suffix: 'đơn'
    },
    {
      to: '/offers',
      icon: <Ticket className='h-6 w-6' />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accentColor: 'from-emerald-400 to-emerald-600',
      label: t('profile.stats.vouchers', 'Voucher khả dụng'),
      value: 0,
      suffix: 'voucher'
    },
    {
      to: '/rewards',
      icon: <Coins className='h-6 w-6' />,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      accentColor: 'from-orange-400 to-red-500',
      label: t('profile.stats.points', 'V-Point của tôi'),
      value: new Intl.NumberFormat('vi-VN').format(user.currentVpoint || 0),
      suffix: 'điểm'
    }
  ]

  const infoFields = [
    {
      icon: <UserCircle className='h-5 w-5' />,
      label: 'Họ và tên',
      value: user.fullName || user.username,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50'
    },
    {
      icon: <Phone className='h-5 w-5' />,
      label: 'Số điện thoại',
      value: user.phone || 'Chưa cập nhật',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      empty: !user.phone
    },
    {
      icon: <Mail className='h-5 w-5' />,
      label: 'Email',
      value: user.email,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50'
    },
    {
      icon: <Calendar className='h-5 w-5' />,
      label: 'Ngày sinh',
      value: formatDob(user.dob),
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      empty: !user.dob
    }
  ]

  return (
    <div className='flex flex-col gap-5'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.to}
            className='group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 p-5'
          >
            {/* Hover gradient accent */}
            <div
              className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${stat.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            <div className='flex items-start justify-between mb-4'>
              <div
                className={`h-11 w-11 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.icon}
              </div>
              <ChevronRight className='h-4 w-4 text-slate-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all' />
            </div>

            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'>
              {stat.label}
            </p>
            <p className='text-2xl font-black text-slate-800 leading-none'>
              {stat.value}
              <span className='text-sm font-medium text-slate-400 ml-1'>{stat.suffix}</span>
            </p>
          </Link>
        ))}
      </div>

      {/* Account Info Card */}
      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-6 py-4 flex items-center justify-between border-b border-slate-50'>
          <div className='flex items-center gap-2'>
            <div className='h-1 w-4 rounded-full bg-red-500' />
            <h2 className='text-base font-bold text-slate-800'>Thông tin tài khoản</h2>
          </div>
          <Link
            to='/profile/edit'
            className='inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors'
          >
            Chỉnh sửa
            <ChevronRight className='h-3 w-3' />
          </Link>
        </div>

        {/* Info Grid */}
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {infoFields.map((field, i) => (
            <div
              key={i}
              className='flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group'
            >
              <div
                className={`h-9 w-9 rounded-lg ${field.iconBg} ${field.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                {field.icon}
              </div>
              <div className='min-w-0'>
                <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5'>
                  {field.label}
                </p>
                <p
                  className={`text-sm font-semibold leading-snug ${field.empty ? 'text-slate-400 italic' : 'text-slate-800'}`}
                >
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
