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
      <div className='fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-8 duration-300'>
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
        <div className='flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col md:flex-row gap-0'>
          {/* CỘT TRÁI: Lịch sử đơn hàng (Timeline zigzag) */}
          <div className='w-full md:w-[340px] shrink-0 md:border-r border-slate-100 md:pr-6 pb-6 md:pb-0'>
            <h3 className='text-base font-bold text-slate-800 flex items-center gap-2 mb-5'>
              <Clock className='h-5 w-5 text-violet-600' /> Lịch sử đơn hàng
            </h3>

            {/* Zigzag Timeline */}
            <div className='relative'>
              {/* Đường thẳng ở giữa */}
              <div className='absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-200 to-transparent' />

              <div className='flex flex-col gap-0'>
                {sortedHistories.map((history, index) => {
                  const isLatest = index === 0
                  const isLeft = index % 2 === 0 // chẵn: nội dung bên trái, dot giữa; lẻ: nội dung bên phải

                  return (
                    <div
                      key={history.id}
                      className={cn(
                        'relative flex items-center mb-5',
                        isLeft ? 'flex-row' : 'flex-row-reverse'
                      )}
                    >
                      {/* Nội dung */}
                      <div
                        className={cn(
                          'w-[calc(50%-20px)] flex flex-col',
                          isLeft ? 'items-end text-right pr-3' : 'items-start text-left pl-3'
                        )}
                      >
                        <Badge
                          variant='outline'
                          className={cn(
                            'mb-1 text-xs font-semibold',
                            isLatest
                              ? 'border-red-200 bg-red-50 text-red-600'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          )}
                        >
                          {statusMap[history.newStatus]}
                        </Badge>
                        {history.note && (
                          <p className='text-xs font-medium text-slate-700 leading-snug'>
                            {history.note}
                          </p>
                        )}
                        <p className='text-[11px] text-slate-400 mt-0.5'>
                          {formatDateTime(history.createdAt)}
                        </p>
                      </div>

                      {/* Dot ở giữa */}
                      <div className='absolute left-1/2 -translate-x-1/2 z-10'>
                        <div
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white shadow-sm',
                            isLatest ? 'bg-red-500' : 'bg-slate-300'
                          )}
                        >
                          {isLatest ? (
                            <CheckCircle2 className='h-3.5 w-3.5 text-white' />
                          ) : (
                            <div className='h-2 w-2 rounded-full bg-white' />
                          )}
                        </div>
                      </div>

                      {/* Phần rỗng bên kia để căn đối xứng */}
                      <div className='w-[calc(50%-20px)]' />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin đơn & Sản phẩm */}
          <div className='flex-1 md:pl-6 space-y-6 border-t md:border-t-0 pt-6 md:pt-0'>
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
        </div>
      </div>
    </>
  )
}
