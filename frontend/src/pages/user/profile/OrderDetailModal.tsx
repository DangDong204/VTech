import { X, MapPin, Package, CreditCard, Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { OrderResponse, OrderStatus } from '@/services/order/order.type'

interface OrderDetailModalProps {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
  statusMap: Record<OrderStatus, string>
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function OrderDetailModal({ order, isOpen, onClose, statusMap }: OrderDetailModalProps) {
  if (!isOpen || !order) return null

  // Sắp xếp lịch sử mới nhất lên đầu
  const sortedHistories = [...order.orderHistories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-8 duration-300'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b shrink-0'>
          <div>
            <h2 className='text-lg font-bold text-slate-800 uppercase'>
              Chi tiết đơn hàng: {order.orderCode}
            </h2>
            <p className='text-sm text-slate-500 mt-0.5'>
              Đặt lúc: {formatDateTime(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        {/* Body (Scrollable) */}
        <div className='flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col md:flex-row gap-8'>
          {/* CỘT TRÁI: Thông tin đơn & Sản phẩm */}
          <div className='flex-[2] space-y-6'>
            {/* Địa chỉ nhận hàng */}
            <div>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2 mb-3'>
                <MapPin className='h-5 w-5 text-red-600' /> Thông tin nhận hàng
              </h3>
              <div className='p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-sm text-slate-700'>
                <p>
                  <span className='font-semibold text-slate-900'>{order.customerName}</span> |{' '}
                  {order.customerPhone}
                </p>
                <p>{order.customerAddress}</p>
                {order.note && (
                  <p className='text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-100'>
                    <strong>Ghi chú:</strong> {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2 mb-3'>
                <Package className='h-5 w-5 text-blue-600' /> Sản phẩm đã đặt
              </h3>
              <div className='space-y-3'>
                {order.orderDetails.map((item) => (
                  <div
                    key={item.id}
                    className='flex gap-3 p-3 border border-slate-100 rounded-xl bg-white'
                  >
                    <div className='h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-50 p-1 border border-slate-100'>
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className='w-full h-full object-contain'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-semibold text-slate-800 truncate'>
                        {item.productName} {item.variantName}
                      </h4>
                      <p className='text-xs text-slate-500 mt-0.5'>Màu: {item.colorName}</p>
                      <div className='flex justify-between items-end mt-1'>
                        <span className='text-sm font-medium'>SL: x{item.quantity}</span>
                        <span className='text-sm font-bold text-red-600'>
                          {formatVnd(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tóm tắt thanh toán */}
            <div>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2 mb-3'>
                <CreditCard className='h-5 w-5 text-emerald-600' /> Thanh toán
              </h3>
              <div className='p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Tạm tính</span>
                  <span className='font-medium text-slate-800'>{formatVnd(order.subTotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Phí vận chuyển</span>
                  <span className='font-medium text-slate-800'>{formatVnd(order.shippingFee)}</span>
                </div>
                {order.productDiscount > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-slate-500'>Giảm giá</span>
                    <span className='font-medium text-red-600'>
                      -{formatVnd(order.productDiscount)}
                    </span>
                  </div>
                )}
                <Separator className='bg-slate-200' />
                <div className='flex justify-between items-center'>
                  <span className='font-bold text-slate-800'>Tổng cộng</span>
                  <span className='text-xl font-extrabold text-red-600'>
                    {formatVnd(order.finalPrice)}
                  </span>
                </div>
                <div className='pt-2 mt-2 border-t border-dashed border-slate-300 flex justify-between'>
                  <span className='text-slate-500'>Phương thức:</span>
                  <span className='font-semibold text-slate-800 uppercase'>
                    {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Lịch sử đơn hàng (Timeline) */}
          <div className='flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8'>
            <h3 className='text-base font-bold text-slate-800 flex items-center gap-2 mb-4'>
              <Clock className='h-5 w-5 text-violet-600' /> Lịch sử đơn hàng
            </h3>

            <div className='relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent'>
              {sortedHistories.map((history, index) => {
                const isLatest = index === 0
                return (
                  <div key={history.id} className='relative flex items-start gap-4'>
                    <div
                      className={cn(
                        'relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                        isLatest ? 'bg-red-600' : 'bg-slate-300'
                      )}
                    >
                      {isLatest ? (
                        <CheckCircle2 className='h-3 w-3 text-white' />
                      ) : (
                        <div className='h-2 w-2 rounded-full bg-white' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'mb-1',
                          isLatest
                            ? 'border-red-200 bg-red-50 text-red-600'
                            : 'border-slate-200 text-slate-600'
                        )}
                      >
                        {statusMap[history.newStatus]}
                      </Badge>
                      <p className='text-sm font-medium text-slate-800'>{history.note}</p>
                      <p className='text-xs text-slate-500 mt-1'>
                        {formatDateTime(history.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
