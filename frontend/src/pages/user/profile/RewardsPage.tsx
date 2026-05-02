import { getMyProfileApi } from '@/services/user/user.api'
import { getUserVpointHistoryApi } from '@/services/vpoint/vpoint.api'
import type { MemberTier, VpointTransactionType } from '@/services/vpoint/vpoint.type'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  Gem,
  Gift,
  ShieldAlert,
  Sparkles,
  Star
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

// ĐÃ CẬP NHẬT MỐC ĐIỂM MỚI VÀ HỆ SỐ NHÂN (MULTIPLIER)
const TIER_CONFIG = {
  MEMBER: {
    label: 'Thành viên',
    sublabel: 'Thành viên mới',
    gradient: 'from-slate-400 to-slate-600',
    cardGradient: 'from-slate-600 via-slate-700 to-slate-800',
    badge: 'bg-slate-200 text-slate-700',
    barColor: 'bg-slate-500',
    icon: <Star className='h-5 w-5' />,
    next: 'SILVER',
    max: 1000,
    multiplier: 'x1.0' // Thêm hệ số
  },
  SILVER: {
    label: 'Bạc',
    sublabel: 'Thành viên Bạc',
    gradient: 'from-slate-300 to-slate-500',
    cardGradient: 'from-slate-500 via-slate-600 to-slate-700',
    badge: 'bg-slate-100 text-slate-600',
    barColor: 'bg-gradient-to-r from-slate-400 to-slate-600',
    icon: <Star className='h-5 w-5 fill-current' />,
    next: 'GOLD',
    max: 5000,
    multiplier: 'x1.1' // Thêm hệ số
  },
  GOLD: {
    label: 'Vàng',
    sublabel: 'Thành viên Vàng',
    gradient: 'from-yellow-400 to-amber-600',
    cardGradient: 'from-amber-500 via-yellow-600 to-orange-600',
    badge: 'bg-yellow-100 text-yellow-700',
    barColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    icon: <Crown className='h-5 w-5' />,
    next: 'DIAMOND',
    max: 20000,
    multiplier: 'x1.25' // Thêm hệ số
  },
  DIAMOND: {
    label: 'Kim Cương',
    sublabel: 'Thành viên Kim Cương',
    gradient: 'from-sky-400 to-blue-600',
    cardGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    badge: 'bg-sky-100 text-sky-700',
    barColor: 'bg-gradient-to-r from-sky-400 to-blue-500',
    icon: <Gem className='h-5 w-5' />,
    next: 'MAX',
    max: 20000,
    multiplier: 'x1.5' // Thêm hệ số
  }
}

const TRANSACTION_MAP: Record<VpointTransactionType, { label: string; category: string }> = {
  EARN_ORDER: { label: 'Tích điểm đơn hàng', category: 'Mua sắm' },
  EARN_REVIEW_TEXT: { label: 'Đánh giá sản phẩm', category: 'Đánh giá' },
  EARN_REVIEW_MEDIA: { label: 'Đánh giá chi tiết (Ảnh/Video)', category: 'Đánh giá' },
  EARN_BIRTHDAY: { label: 'Quà tặng sinh nhật', category: 'Ưu đãi' },
  EARN_ADMIN_GIFT: { label: 'Hệ thống tặng điểm', category: 'Ưu đãi' },
  SPEND_ORDER: { label: 'Thanh toán đơn hàng', category: 'Sử dụng' },
  REDEEM_VOUCHER: { label: 'Đổi điểm lấy Voucher', category: 'Ưu đãi' },
  REFUND_ORDER: { label: 'Hoàn điểm hủy đơn', category: 'Hoàn tiền' },
  DEDUCT_RETURN: { label: 'Thu hồi do trả hàng', category: 'Thu hồi' }
}

const getTransactionInfo = (type: VpointTransactionType) =>
  TRANSACTION_MAP[type] || { label: 'Biến động V-Point', category: 'Khác' }

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  } catch {
    return dateStr
  }
}

export default function RewardsPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfileApi
  })

  const { data: histories = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['vpoint-history', user?.id],
    queryFn: () => getUserVpointHistoryApi(user!.id),
    enabled: !!user?.id
  })

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

  const tier = (user.memberTier as MemberTier) || 'MEMBER'
  const cfg = TIER_CONFIG[tier]
  const progressPercent =
    tier === 'DIAMOND' ? 100 : Math.min(100, ((user.totalVpoint || 0) / cfg.max) * 100)
  const pointsLeft = cfg.max - (user.totalVpoint || 0)

  return (
    <div className='flex flex-col gap-5'>
      {/* ── MEMBERSHIP CARD ── */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.cardGradient} p-6 text-white shadow-xl`}
        style={{ minHeight: 200 }}
      >
        {/* Background patterns */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white' />
          <div className='absolute -left-6 -bottom-10 h-36 w-36 rounded-full bg-white' />
          <div className='absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-white' />
        </div>
        {/* Dots pattern */}
        <div
          className='absolute inset-0 opacity-5'
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className='relative z-10'>
          {/* Top row */}
          <div className='flex items-start justify-between mb-5'>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm bg-white/20`}
              >
                {cfg.icon}
                {cfg.sublabel}
              </span>
            </div>
            <div className='text-right opacity-80'>
              <p className='text-xs font-medium'>V-Point Card</p>
              <p className='text-xs font-mono opacity-60'>
                ****{' '}
                {String(user.id || '0000')
                  .slice(-4)
                  .padStart(4, '0')}
              </p>
            </div>
          </div>

          {/* Main points display */}
          <div className='mb-5'>
            <p className='text-xs font-medium text-white/60 uppercase tracking-widest mb-1'>
              Số dư V-Point
            </p>
            <div className='flex items-end gap-2'>
              <span className='text-4xl font-black leading-none tracking-tight'>
                {new Intl.NumberFormat('vi-VN').format(user.currentVpoint || 0)}
              </span>
              <span className='text-base font-semibold text-white/70 pb-1'>điểm</span>
            </div>
            <p className='text-xs text-white/50 mt-1'>
              Tổng tích lũy:{' '}
              <span className='font-semibold text-white/80'>
                {new Intl.NumberFormat('vi-VN').format(user.totalVpoint || 0)} điểm
              </span>
            </p>
          </div>

          {/* Progress bar */}
          {tier !== 'DIAMOND' && (
            <div>
              <div className='flex justify-between text-xs font-medium text-white/70 mb-2'>
                <span className='flex items-center gap-1'>
                  <Sparkles className='h-3 w-3 text-yellow-300' />
                  Tiến trình lên hạng{' '}
                  <strong className='text-white'>
                    {TIER_CONFIG[cfg.next as MemberTier]?.label}
                  </strong>
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className='h-2 w-full bg-white/20 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-white rounded-full transition-all duration-1000 ease-out'
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className='text-xs text-white/60 mt-2'>
                Cần thêm{' '}
                <span className='font-bold text-white'>
                  {new Intl.NumberFormat('vi-VN').format(pointsLeft > 0 ? pointsLeft : 0)}
                </span>{' '}
                điểm để thăng hạng
              </p>
            </div>
          )}

          {tier === 'DIAMOND' && (
            <div className='flex items-center gap-2 text-sm font-semibold text-yellow-300'>
              <Crown className='h-4 w-4 fill-yellow-300' />
              Bạn đang ở hạng cao nhất — Chúc mừng!
            </div>
          )}
        </div>
      </div>

      {/* ── BỔ SUNG: DÒNG GIẢI THÍCH NHANH QUY TẮC TÍCH ĐIỂM ── */}
      <div className='bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm'>
        <Sparkles className='w-5 h-5 shrink-0 mt-0.5 text-blue-500' />
        <div>
          <strong>Quy tắc nhân điểm:</strong> Điểm cơ bản được tính là{' '}
          <span className='font-bold text-red-600'>10.000đ = 1 điểm</span>. Điểm thực nhận của bạn
          sẽ được nhân với <strong>Hệ số hạng</strong> tương ứng bên dưới!
        </div>
      </div>

      {/* ── TIER BENEFITS ROW ── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {Object.entries(TIER_CONFIG)
          .filter(([k]) => k !== 'MAX')
          .map(([key, val]) => {
            const isCurrent = key === tier
            const isPast =
              Object.keys(TIER_CONFIG).indexOf(key) < Object.keys(TIER_CONFIG).indexOf(tier)
            return (
              <div
                key={key}
                className={`relative rounded-xl p-3 border text-center transition-all ${
                  isCurrent
                    ? `bg-gradient-to-br ${val.gradient} text-white border-transparent shadow-md transform scale-[1.02] ring-2 ring-offset-2 ring-red-400`
                    : isPast
                      ? 'bg-slate-50 border-slate-100 opacity-60'
                      : 'bg-white border-slate-100'
                }`}
              >
                {isCurrent && (
                  <div className='absolute -top-2.5 left-1/2 -translate-x-1/2 z-10'>
                    <span className='bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm'>
                      Hiện tại
                    </span>
                  </div>
                )}

                <div className='flex justify-between items-start mb-2'>
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isCurrent ? 'bg-white/20' : 'bg-slate-100'
                    }`}
                  >
                    <span className={isCurrent ? 'text-white' : 'text-slate-500'}>{val.icon}</span>
                  </div>

                  {/* BỔ SUNG: HIỂN THỊ HỆ SỐ TÍCH ĐIỂM Ở GÓC PHẢI THẺ */}
                  <span
                    className={`text-lg font-extrabold ${isCurrent ? 'text-white' : 'text-red-500'}`}
                  >
                    {val.multiplier}
                  </span>
                </div>

                <p
                  className={`text-xs font-bold text-left ${isCurrent ? 'text-white' : 'text-slate-700'}`}
                >
                  {val.label}
                </p>
                <p
                  className={`text-[10px] text-left mt-0.5 ${isCurrent ? 'text-white/70' : 'text-slate-400'}`}
                >
                  Yêu cầu: {new Intl.NumberFormat('vi-VN').format(val.max)} điểm
                </p>
              </div>
            )
          })}
      </div>

      {/* ── TRANSACTION HISTORY ── */}
      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='h-1 w-4 rounded-full bg-red-500' />
            <h2 className='text-base font-bold text-slate-800'>Lịch sử giao dịch V-Point</h2>
          </div>
          {histories.length > 0 && (
            <span className='text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full'>
              {histories.length} giao dịch
            </span>
          )}
        </div>

        {isLoadingHistory ? (
          <div className='flex items-center justify-center py-16'>
            <div className='h-8 w-8 rounded-full border-3 border-red-400 border-t-transparent animate-spin' />
          </div>
        ) : histories.length > 0 ? (
          <div className='divide-y divide-slate-50'>
            {histories.map((item, i) => {
              const isEarn = item.amount > 0
              const info = getTransactionInfo(item.transactionType as VpointTransactionType) // Sửa lỗi Type TypeScript
              return (
                <div
                  key={item.id}
                  className='px-6 py-4 flex items-center gap-4 hover:bg-slate-50/70 transition-colors'
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowUpRight className='h-5 w-5' />
                    ) : (
                      <ArrowDownRight className='h-5 w-5' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='text-sm font-bold text-slate-800 truncate'>{info.label}</p>
                      <span className='shrink-0 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full'>
                        {info.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className='text-xs text-slate-500 mt-0.5 truncate'>{item.description}</p>
                    )}
                    <p className='text-xs text-slate-400 mt-1'>{formatDate(item.createdAt)}</p>
                  </div>

                  <div className='text-right shrink-0'>
                    <span
                      className={`text-base font-black ${
                        isEarn ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {isEarn ? '+' : ''}
                      {new Intl.NumberFormat('vi-VN').format(item.amount)}
                    </span>
                    <p className='text-xs text-slate-400 font-medium'>điểm</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='py-20 flex flex-col items-center justify-center text-center px-6'>
            <div className='h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 shadow-inner'>
              <Gift className='h-10 w-10 text-slate-300' />
            </div>
            <p className='text-base font-bold text-slate-700 mb-1'>Chưa có lịch sử tích điểm</p>
            <p className='text-sm text-slate-400 max-w-xs leading-relaxed'>
              Mua sắm và đánh giá sản phẩm để tích lũy V-Point và nhận nhiều ưu đãi hấp dẫn!
            </p>
            <button
              onClick={() => navigate('/products')} // Gắn link để điều hướng đi mua sắm
              className='mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-5 py-2.5 transition-colors shadow-sm shadow-red-200'
            >
              <ShieldAlert className='h-4 w-4' />
              Khám phá ưu đãi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
