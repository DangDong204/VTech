import { useState, useEffect, useMemo } from 'react'
import { Search, Store, Loader2, PackageX, CheckCircle2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  cancelOrderApi,
  getMyOrdersApi,
  confirmReceiptApi,
  returnOrderApi
} from '@/services/order/order.api'
import type { OrderResponse, OrderStatus } from '@/services/order/order.type'
import { OrderDetailModal } from '@/pages/user/profile/OrderDetailModal'

const ORDER_TABS = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy']

// Dictionary dịch trạng thái từ Backend -> UI
const STATUS_MAP: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đang xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả'
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Loading states cho các hành động
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)

  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)

  // Fetch dữ liệu thật từ Backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const data = await getMyOrdersApi()
        setOrders(data)
      } catch {
        toast.error('Không thể tải lịch sử đơn hàng.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Filter: Áp dụng cả Tab + Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const mappedStatus = STATUS_MAP[order.orderStatus]
      const passTab = activeTab === 'Tất cả' || mappedStatus === activeTab

      const keyword = searchTerm.toLowerCase()
      const passSearch =
        order.orderCode.toLowerCase().includes(keyword) ||
        order.orderDetails.some((item) => item.productName.toLowerCase().includes(keyword))

      return passTab && passSearch
    })
  }, [orders, activeTab, searchTerm])

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'default'
      case 'CANCELLED':
      case 'RETURNED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusBadgeStyle = (status: OrderStatus) => {
    if (status === 'SHIPPING') return 'bg-blue-50 text-blue-600 border-blue-200'
    if (status === 'PENDING') return 'bg-amber-50 text-amber-600 border-amber-200'
    if (status === 'RETURNED') return 'bg-slate-100 text-slate-700 border-slate-200'
    return ''
  }

  // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG ĐƠN HÀNG ---

  // 1. Hủy đơn (Khi PENDING)
  const handleCancelOrder = async (orderId: string) => {
    const reason = window.prompt('Vui lòng nhập lý do hủy đơn (không bắt buộc):')
    if (reason === null) return

    try {
      setCancellingId(orderId)
      const updatedOrder = await cancelOrderApi(orderId, reason)
      toast.success('Hủy đơn hàng thành công!')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)))
    } catch {
      toast.error('Có lỗi xảy ra khi hủy đơn!')
    } finally {
      setCancellingId(null)
    }
  }

  // 2. Xác nhận đã nhận hàng (Khi SHIPPING)
  const handleConfirmReceipt = async (orderId: string) => {
    if (!window.confirm('Bạn xác nhận đã nhận được hàng và sản phẩm không có vấn đề gì?')) return

    try {
      setConfirmingId(orderId)
      const updatedOrder = await confirmReceiptApi(orderId)
      toast.success('Cảm ơn bạn đã mua sắm tại VTech!')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)))
    } catch {
      toast.error('Có lỗi xảy ra!')
    } finally {
      setConfirmingId(null)
    }
  }

  // 3. Hoàn trả (Khi DELIVERED)
  const handleReturnOrder = async (orderId: string) => {
    const reason = window.prompt(
      'Vui lòng nhập lý do hoàn trả (Ví dụ: Hàng lỗi, không đúng mô tả...):'
    )
    if (reason === null) return
    if (reason.trim() === '') {
      toast.error('Bạn cần nhập lý do hoàn trả để admin xử lý.')
      return
    }

    try {
      setReturningId(orderId)
      const updatedOrder = await returnOrderApi(orderId, reason)
      toast.success('Đã gửi yêu cầu hoàn trả thành công!')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)))
    } catch {
      toast.error('Có lỗi xảy ra khi yêu cầu hoàn trả!')
    } finally {
      setReturningId(null)
    }
  }

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden min-h-[60vh] flex flex-col'>
        {/* Tabs */}
        <div className='flex overflow-x-auto scrollbar-hide border-b'>
          {ORDER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-600 hover:text-red-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm */}
        <div className='p-4 bg-slate-50/50 border-b'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Tìm theo mã đơn hàng, tên sản phẩm...'
              className='pl-9 bg-white border-slate-200'
            />
          </div>
        </div>

        {/* Trạng thái Loading */}
        {isLoading ? (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400 py-12'>
            <Loader2 className='h-8 w-8 animate-spin mb-4 text-slate-300' />
            <p className='text-sm'>Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : (
          /* Danh sách đơn hàng */
          <div className='flex flex-col gap-4 p-4 bg-slate-50/50 flex-1'>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className='border rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300 hover:border-red-500 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01]'
                >
                  {/* Header đơn hàng */}
                  <div className='flex items-center justify-between p-4 border-b bg-slate-50/50'>
                    <div className='flex items-center gap-4 text-sm'>
                      <span className='font-bold text-slate-800 uppercase'>
                        Mã ĐH: {order.orderCode}
                      </span>
                      <span className='text-slate-500 hidden sm:inline'>
                        Ngày đặt: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(order.orderStatus)}
                      className={getStatusBadgeStyle(order.orderStatus)}
                    >
                      {STATUS_MAP[order.orderStatus]}
                    </Badge>
                  </div>

                  {/* Body đơn hàng: Danh sách sản phẩm */}
                  <div className='p-4'>
                    {order.orderDetails.map((item) => (
                      <div key={item.id} className='flex gap-4 mb-4 last:mb-0'>
                        <div className='h-20 w-20 shrink-0 border border-slate-100 rounded-md overflow-hidden bg-white flex items-center justify-center p-1'>
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className='max-h-full max-w-full object-contain'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-sm font-semibold text-slate-800 truncate'>
                            {item.productName} {item.variantName}
                          </h4>
                          <div className='flex items-center gap-1.5 text-xs text-slate-500 mt-1'>
                            <span>Màu:</span>
                            <span className='font-medium'>{item.colorName}</span>
                          </div>
                          <p className='text-sm font-medium mt-1'>x{item.quantity}</p>
                        </div>
                        <div className='text-right shrink-0 flex flex-col justify-between'>
                          <span className='text-sm font-bold text-red-600'>
                            {formatVnd(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer đơn hàng */}
                  <div className='p-4 border-t flex flex-wrap items-center justify-between gap-4 bg-slate-50/30'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                      <div className='flex items-center gap-2'>
                        <Store className='h-4 w-4 text-slate-400' />
                        <span className='text-sm text-slate-600'>Thành tiền:</span>
                      </div>
                      <span className='text-lg font-bold text-red-600'>
                        {formatVnd(order.finalPrice)}
                      </span>
                    </div>

                    {/* CÁC NÚT THAO TÁC */}
                    <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end'>
                      {/* Nút: Hủy đơn hàng */}
                      {order.orderStatus === 'PENDING' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200'
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                        >
                          {cancellingId === order.id && (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          )}
                          Hủy đơn
                        </Button>
                      )}

                      {/* Nút: Đã nhận hàng */}
                      {order.orderStatus === 'SHIPPING' && (
                        <Button
                          variant='default'
                          size='sm'
                          className='flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white'
                          onClick={() => handleConfirmReceipt(order.id)}
                          disabled={confirmingId === order.id}
                        >
                          {confirmingId === order.id ? (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
                          )}
                          Đã nhận hàng
                        </Button>
                      )}

                      {/* Nút: Hoàn trả */}
                      {order.orderStatus === 'DELIVERED' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1 sm:flex-none text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                          onClick={() => handleReturnOrder(order.id)}
                          disabled={returningId === order.id}
                        >
                          {returningId === order.id ? (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <RefreshCcw className='mr-1.5 h-3.5 w-3.5' />
                          )}
                          Hoàn trả
                        </Button>
                      )}

                      {/* Nút: Xem chi tiết */}
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 sm:flex-none'
                        onClick={() => setSelectedOrder(order)}
                      >
                        Xem chi tiết
                      </Button>

                      {/* Nút: Mua lại (Khi đã hoàn thành, bị hủy hoặc hoàn trả) */}
                      {['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.orderStatus) && (
                        <Button
                          size='sm'
                          className='flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white'
                        >
                          Mua lại
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='py-20 flex flex-col items-center justify-center text-center'>
                <div className='h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                  <PackageX className='h-10 w-10 text-slate-300' />
                </div>
                <h3 className='text-lg font-bold text-slate-700'>Không tìm thấy đơn hàng</h3>
                <p className='text-slate-500 text-sm mt-1'>
                  {searchTerm
                    ? 'Không có đơn hàng nào khớp với tìm kiếm.'
                    : 'Bạn chưa có đơn hàng nào trong trạng thái này.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        statusMap={STATUS_MAP}
      />
    </div>
  )
}
