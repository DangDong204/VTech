import { Button } from '@/components/ui/button'
import { getMyProfileApi } from '@/services/user/user.api'
import {
  getRedeemableVouchersApi,
  redeemVoucherApi,
  getMyVouchersApi
} from '@/services/voucher/voucher.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Database, Gift, Ticket, Wallet, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function OffersPage() {
  const { t } = useTranslation('profile')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'REDEEM' | 'WALLET'>('WALLET')

  // 1. Lấy thông tin user
  const { data: user } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfileApi
  })

  // 2. Lấy danh sách voucher CÓ THỂ ĐỔI
  const { data: redeemableVouchers, isLoading: loadingRedeemable } = useQuery({
    queryKey: ['redeemable-vouchers'],
    queryFn: getRedeemableVouchersApi
  })

  // 3. Lấy danh sách ví voucher CỦA TÔI
  const { data: myVouchers, isLoading: loadingWallet } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: getMyVouchersApi
  })

  // 4. Mutation xử lý đổi điểm
  const redeemMutation = useMutation({
    mutationFn: (id: string) => redeemVoucherApi(id),
    onSuccess: (res) => {
      toast.success(res.message || t('offers.messages.redeemSuccess', 'Đổi voucher thành công!'))
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      queryClient.invalidateQueries({ queryKey: ['redeemable-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] }) // Cập nhật lại ví
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t('offers.messages.redeemError', 'Có lỗi xảy ra khi đổi điểm')
      )
    }
  })

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null
    // Chuyển "07-05-2026 10:04:00" → "2026-05-07T10:04:00"
    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('-')
    return new Date(`${year}-${month}-${day}T${timePart}`)
  }

  // Component render từng thẻ Voucher (Dùng chung cho cả 2 tab)
  const VoucherCard = ({ v, isWallet }: { v: any; isWallet?: boolean }) => {
    const canAfford = (user?.currentVpoint || 0) >= v.requiredPoints
    const isOwned = myVouchers?.some((myV) => myV.id === v.id)

    return (
      <div className='bg-white flex rounded-xl border border-slate-200 overflow-hidden hover:border-red-200 transition-colors shadow-sm group'>
        {/* Left side: Icon/Type */}
        <div
          className={`w-24 flex flex-col items-center justify-center text-white p-2 relative ${isWallet ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          <div className='absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-full flex flex-col justify-around'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='w-2 h-2 rounded-full bg-slate-50' />
            ))}
          </div>
          <Ticket className='h-8 w-8 mb-1' />
          <span className='text-[10px] font-bold uppercase tracking-wider text-center'>
            {v.type.replace('_', ' ')}
          </span>
        </div>

        {/* Right side: Info */}
        <div className='flex-1 p-4 flex flex-col justify-between'>
          <div>
            <h3 className='font-bold text-slate-800 line-clamp-1'>{v.voucherName}</h3>
            <p className='text-xs text-slate-500 mt-1'>
              {t('offers.card.minOrder', 'Đơn tối thiểu')} {formatVND(v.minOrderValue)}
            </p>
            <div className='flex items-center gap-1 text-xs text-orange-600 mt-2 font-medium'>
              <Clock className='h-3 w-3' />
              {t('offers.card.expiry', 'Hạn dùng:')}{' '}
              {parseDate(v.endDate)?.toLocaleDateString('vi-VN')}
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between gap-2 border-t pt-3'>
            {isWallet ? (
              // Trạng thái nếu đang xem trong Ví
              <>
                <div className='flex items-center gap-1.5 text-emerald-600'>
                  <CheckCircle2 className='h-4 w-4' />
                  <span className='text-xs font-bold'>
                    {t('offers.card.readyToUse', 'SẴN SÀNG SỬ DỤNG')}
                  </span>
                </div>
                <Button
                  size='sm'
                  className='bg-emerald-500 hover:bg-emerald-600'
                  onClick={() => navigate('/cart')}
                >
                  {t('offers.card.useNow', 'Dùng ngay')}
                </Button>
              </>
            ) : (
              // Trạng thái nếu đang xem ở Gian hàng đổi điểm
              <>
                <div className='flex items-center gap-1'>
                  <span className='text-red-600 font-bold'>{v.requiredPoints}</span>
                  <span className='text-[10px] text-slate-400 font-bold'>POINTS</span>
                </div>
                <Button
                  size='sm'
                  variant={canAfford && !isOwned ? 'default' : 'outline'}
                  className={canAfford && !isOwned ? 'bg-red-600 hover:bg-red-700' : 'opacity-50'}
                  disabled={!canAfford || redeemMutation.isPending || isOwned}
                  onClick={() => redeemMutation.mutate(v.id)}
                >
                  {isOwned
                    ? t('offers.card.redeemed', 'Đã đổi')
                    : redeemMutation.isPending
                      ? t('offers.card.redeeming', 'Đang đổi...')
                      : t('offers.card.redeemNow', 'Đổi ngay')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header & Wallet Info */}
      <div className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 flex items-center gap-2'>
            <Gift className='text-red-500' /> {t('offers.header.title', 'Quản lý Voucher')}
          </h1>
          <p className='text-slate-500 text-sm'>
            {t(
              'offers.header.subtitle',
              'Sử dụng V-Point tích lũy để đổi mã giảm giá hoặc xem ví của bạn'
            )}
          </p>
        </div>
        <div className='bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-3'>
          <Database className='text-red-600 h-5 w-5' />
          <div>
            <p className='text-xs text-red-600 font-medium uppercase'>
              {t('offers.header.currentPoints', 'Điểm hiện có')}
            </p>
            <p className='text-xl font-bold text-red-700'>
              {user?.currentVpoint?.toLocaleString() || 0} V-Point
            </p>
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className='flex gap-2 p-1 bg-slate-100 rounded-xl w-full max-w-sm'>
        <button
          onClick={() => setActiveTab('WALLET')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${
            activeTab === 'WALLET'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wallet className='h-4 w-4' /> {t('offers.tabs.wallet', 'Ví Của Tôi')}
          {myVouchers && myVouchers.length > 0 && (
            <span className='bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[10px] leading-none'>
              {myVouchers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('REDEEM')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'REDEEM'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('offers.tabs.redeem', 'Đổi Điểm Nhận Mã')}
        </button>
      </div>

      {/* Tab Content: WALLET */}
      {activeTab === 'WALLET' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2'>
          {loadingWallet ? (
            [1, 2].map((i) => (
              <div key={i} className='h-32 bg-slate-100 animate-pulse rounded-xl' />
            ))
          ) : myVouchers?.length === 0 ? (
            <div className='col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-emerald-200'>
              <Wallet className='mx-auto h-16 w-16 text-slate-200 mb-4' />
              <p className='text-lg font-bold text-slate-700 mb-1'>
                {t('offers.emptyWallet.title', 'Ví của bạn đang trống')}
              </p>
              <p className='text-slate-500 text-sm max-w-xs mx-auto'>
                {t(
                  'offers.emptyWallet.subtitle',
                  'Hãy sang tab "Đổi Điểm Nhận Mã" để sưu tầm ngay các ưu đãi hấp dẫn nhé!'
                )}
              </p>
              <Button
                onClick={() => setActiveTab('REDEEM')}
                className='mt-6 bg-emerald-500 hover:bg-emerald-600'
              >
                {t('offers.emptyWallet.button', 'Tìm mã giảm giá')}
              </Button>
            </div>
          ) : (
            myVouchers?.map((v) => <VoucherCard key={v.id} v={v} isWallet={true} />)
          )}
        </div>
      )}

      {/* Tab Content: REDEEM */}
      {activeTab === 'REDEEM' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2'>
          {loadingRedeemable ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className='h-32 bg-slate-100 animate-pulse rounded-xl' />
            ))
          ) : redeemableVouchers?.length === 0 ? (
            <div className='col-span-full py-12 text-center bg-white rounded-xl border border-dashed'>
              <Ticket className='mx-auto h-12 w-12 text-slate-300 mb-3' />
              <p className='text-slate-500'>
                {t('offers.emptyRedeem', 'Hiện chưa có ưu đãi nào khả dụng để đổi.')}
              </p>
            </div>
          ) : (
            redeemableVouchers?.map((v) => <VoucherCard key={v.id} v={v} isWallet={false} />)
          )}
        </div>
      )}
    </div>
  )
}
