import { useEffect, useState } from 'react'
import { X, Ticket, Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllVoucherApi } from '@/services/voucher/voucher.api'
import { toast } from 'sonner'

// Định nghĩa nhanh type (hoặc import từ voucher.type nếu bạn có sẵn)
type Voucher = {
  id: string
  voucherCode: string
  voucherName: string
  type: 'FREE_SHIP' | 'FIXED_AMOUNT' | 'PERCENTAGE'
  discountValue: number
  maxDiscountAmount: number | null
  minOrderValue: number
  endDate: string
  status: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (code: string) => void
  subTotal: number
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

export function VoucherListModal({ isOpen, onClose, onSelect, subTotal }: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const fetchVouchers = async () => {
        setIsLoading(true)
        try {
          const data = await getAllVoucherApi()
          // Chỉ lọc ra các voucher đang ACTIVE và còn hạn
          const now = new Date().getTime()
          const activeVouchers = (data as Voucher[]).filter(
            (v) => v.status === 'ACTIVE' && new Date(v.endDate).getTime() > now
          )
          setVouchers(activeVouchers)
        } catch {
          toast.error('Không thể tải danh sách mã giảm giá')
        } finally {
          setIsLoading(false)
        }
      }
      fetchVouchers()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Phân loại voucher: Đủ điều kiện và Chưa đủ điều kiện
  const validVouchers = vouchers.filter((v) => subTotal >= v.minOrderValue)
  const invalidVouchers = vouchers.filter((v) => subTotal < v.minOrderValue)

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4'>
      <div className='bg-slate-50 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 bg-white border-b border-slate-100'>
          <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
            <Ticket className='w-5 h-5 text-red-500' /> Chọn mã giảm giá
          </h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          {isLoading ? (
            <div className='text-center py-10 text-slate-500'>Đang tải mã giảm giá...</div>
          ) : vouchers.length === 0 ? (
            <div className='text-center py-10 text-slate-500'>Hiện chưa có mã giảm giá nào.</div>
          ) : (
            <>
              {/* Danh sách đủ điều kiện */}
              {validVouchers.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wider'>
                    Đủ điều kiện
                  </h3>
                  {validVouchers.map((v) => (
                    <div
                      key={v.id}
                      className='flex bg-white rounded-xl overflow-hidden border border-red-100 shadow-sm relative group'
                    >
                      <div className='bg-gradient-to-br from-red-500 to-rose-500 w-24 flex flex-col items-center justify-center text-white p-2 shrink-0 border-r border-dashed border-white'>
                        <span className='text-2xl font-extrabold'>
                          {v.type === 'PERCENTAGE' ? `${v.discountValue}%` : 'GIẢM'}
                        </span>
                        <span className='text-[10px] uppercase font-medium text-center mt-1'>
                          {v.type === 'FREE_SHIP' ? 'Vận chuyển' : 'Tiền hàng'}
                        </span>
                      </div>
                      <div className='p-3 flex-1 flex flex-col justify-between min-w-0'>
                        <div>
                          <div className='flex items-center justify-between gap-2'>
                            <h4 className='font-bold text-slate-800 text-sm truncate'>
                              {v.voucherCode}
                            </h4>
                            <span className='text-[10px] text-slate-500 flex items-center gap-1 shrink-0'>
                              <Clock className='w-3 h-3' />
                              HSD: {formatDate(v.endDate)}
                            </span>
                          </div>
                          <p className='text-xs text-slate-600 mt-1 line-clamp-2'>
                            {v.voucherName}
                          </p>
                          <p className='text-[11px] text-slate-500 mt-1'>
                            Đơn tối thiểu {formatVnd(v.minOrderValue)}
                          </p>
                        </div>
                        <Button
                          size='sm'
                          onClick={() => onSelect(v.voucherCode)}
                          className='w-full mt-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 h-8'
                        >
                          Dùng ngay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách KHÔNG đủ điều kiện (Làm mờ) */}
              {invalidVouchers.length > 0 && (
                <div className='space-y-3 opacity-60 grayscale-[50%] pointer-events-none'>
                  <h3 className='text-sm font-semibold text-slate-400 uppercase tracking-wider'>
                    Chưa đủ điều kiện
                  </h3>
                  {invalidVouchers.map((v) => (
                    <div
                      key={v.id}
                      className='flex bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative'
                    >
                      <div className='bg-slate-400 w-24 flex flex-col items-center justify-center text-white p-2 shrink-0 border-r border-dashed border-white'>
                        <span className='text-2xl font-extrabold'>
                          {v.type === 'PERCENTAGE' ? `${v.discountValue}%` : 'GIẢM'}
                        </span>
                        <span className='text-[10px] uppercase font-medium text-center mt-1'>
                          {v.type === 'FREE_SHIP' ? 'Vận chuyển' : 'Tiền hàng'}
                        </span>
                      </div>
                      <div className='p-3 flex-1 flex flex-col justify-between min-w-0'>
                        <div>
                          <h4 className='font-bold text-slate-800 text-sm truncate'>
                            {v.voucherCode}
                          </h4>
                          <p className='text-xs text-slate-600 mt-1 line-clamp-2'>
                            {v.voucherName}
                          </p>
                        </div>
                        <div className='mt-2 flex items-center gap-1.5 text-[11px] font-medium text-red-500 bg-red-50 p-1.5 rounded'>
                          <Info className='w-3.5 h-3.5' /> Mua thêm{' '}
                          {formatVnd(v.minOrderValue - subTotal)} để dùng
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
