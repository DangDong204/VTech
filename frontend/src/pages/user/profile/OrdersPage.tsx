import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Store,
  Loader2,
  PackageX,
  CheckCircle2,
  RefreshCcw,
  Wallet,
  MessageSquarePlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  cancelOrderApi,
  getMyOrdersApi,
  confirmReceiptApi,
  returnOrderApi
} from '@/services/order/order.api'
import { api } from '@/utils/axiosCustomize'
import type { OrderResponse, OrderStatus } from '@/services/order/order.type'
import { OrderDetailModal } from '@/pages/user/profile/OrderDetailModal'
import { useCart } from '@/contexts/CartContext'
import { CreateReviewModal } from '@/pages/user/product-detail/CreateReviewModal'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'

const ORDER_TABS = [
  'Tất cả',
  'Chờ xác nhận',
  'Đã xác nhận',
  'Đang đóng gói',
  'Đang giao',
  'Hoàn thành',
  'Đã hủy',
  'Hoàn trả'
]

const STATUS_MAP: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả'
}

// Các tab sẽ được hiển thị số lượng (badge)
const PROCESSING_TABS = ['Chờ xác nhận', 'Đã xác nhận', 'Đang đóng gói', 'Đang giao']

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

  const navigate = useNavigate()
  const { addItem } = useCart()

  // Loading states
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [repurchasingId, setRepurchasingId] = useState<string | null>(null)

  const [reviewingItem, setReviewingItem] = useState<{
    orderDetailId: string
    productName: string
    variantName: string
    imageUrl: string
  } | null>(null)

  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)

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

  // Đếm số lượng đơn hàng cho mỗi tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ORDER_TABS.forEach((tab) => (counts[tab] = 0))
    counts['Tất cả'] = orders.length

    orders.forEach((order) => {
      const mappedStatus = STATUS_MAP[order.orderStatus]
      if (counts[mappedStatus] !== undefined) {
        counts[mappedStatus]++
      }
    })
    return counts
  }, [orders])

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
    if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200'
    if (status === 'CONFIRMED') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (status === 'PROCESSING') return 'bg-purple-50 text-purple-700 border-purple-200'
    if (status === 'SHIPPING') return 'bg-cyan-50 text-cyan-700 border-cyan-200'
    if (status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'CANCELLED') return 'bg-red-50 text-red-700 border-red-200'
    if (status === 'RETURNED') return 'bg-slate-100 text-slate-700 border-slate-200'
    return ''
  }

  const handleReviewSuccess = (orderDetailId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        orderDetails: order.orderDetails.map((item) =>
          item.id === orderDetailId ? { ...item, reviewed: true } : item
        )
      }))
    )
  }

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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>

      const message = axiosError.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn!'
      toast.error(message)
    } finally {
      setReturningId(null)
    }
  }

  const handleContinuePayment = async (orderId: string) => {
    try {
      setPayingId(orderId)
      toast.loading('Đang kết nối tới VNPAY...', { id: 'payment' })
      const res = await api.get(`/client/orders/${orderId}/payment-url`)
      window.location.href = res.data.data
    } catch {
      toast.error('Có lỗi xảy ra khi tạo link thanh toán!', {
        id: 'payment'
      })
      setPayingId(null)
    }
  }

  const handleRepurchase = async (order: OrderResponse) => {
    try {
      setRepurchasingId(order.id)
      toast.loading('Đang chuẩn bị giỏ hàng...', { id: 'repurchase' })

      for (const item of order.orderDetails) {
        await addItem(item.variantId, item.quantity, false)
      }

      toast.success('Đã đưa sản phẩm vào giỏ hàng!', { id: 'repurchase' })
      const variantIds = order.orderDetails.map((d) => d.variantId)
      navigate('/cart', { state: { repurchaseVariantIds: variantIds } })
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.', { id: 'repurchase' })
    } finally {
      setRepurchasingId(null)
    }
  }

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden min-h-[60vh] flex flex-col'>
        {/* ĐÃ SỬA DÒNG NÀY ĐỂ GIẤU THANH CUỘN NGANG */}
        <div className='flex overflow-x-auto border-b [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {ORDER_TABS.map((tab) => {
            const count = tabCounts[tab] || 0
            const showBadge = PROCESSING_TABS.includes(tab) && count > 0

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'border-red-600 text-red-600 bg-red-50/30'
                    : 'border-transparent text-slate-600 hover:text-red-500 hover:bg-slate-50'
                }`}
              >
                {tab}
                {showBadge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                      activeTab === tab ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

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

        {isLoading ? (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400 py-12'>
            <Loader2 className='h-8 w-8 animate-spin mb-4 text-slate-300' />
            <p className='text-sm'>Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4 p-4 bg-slate-50/50 flex-1'>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className='border rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300 hover:border-red-500 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01]'
                >
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
                        <div className='text-right shrink-0 flex flex-col justify-between items-end'>
                          <span className='text-sm font-bold text-red-600'>
                            {formatVnd(item.price)}
                          </span>

                          {order.orderStatus === 'DELIVERED' && !item.reviewed && (
                            <Button
                              size='sm'
                              variant='outline'
                              className='mt-2 h-7 px-2 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                              onClick={() =>
                                setReviewingItem({
                                  orderDetailId: item.id,
                                  productName: item.productName,
                                  variantName: `${item.colorName} ${item.variantName ? '- ' + item.variantName : ''}`,
                                  imageUrl: item.imageUrl
                                })
                              }
                            >
                              <MessageSquarePlus className='h-3 w-3 mr-1.5' />
                              Đánh giá
                            </Button>
                          )}

                          {order.orderStatus === 'DELIVERED' && item.reviewed && (
                            <span className='mt-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100'>
                              Đã đánh giá
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

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

                    <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end'>
                      {order.orderStatus === 'PENDING' && order.paymentMethod === 'VNPAY' && (
                        <Button
                          variant='default'
                          size='sm'
                          className='flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white'
                          onClick={() => handleContinuePayment(order.id)}
                          disabled={payingId === order.id}
                        >
                          {payingId === order.id ? (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <Wallet className='mr-1.5 h-3.5 w-3.5' />
                          )}{' '}
                          Thanh toán
                        </Button>
                      )}

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
                          )}{' '}
                          Hủy đơn
                        </Button>
                      )}

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
                          )}{' '}
                          Đã nhận hàng
                        </Button>
                      )}

                      {order.orderStatus === 'DELIVERED' &&
                        !order.orderDetails.some((item) => item.reviewed) && (
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
                            )}{' '}
                            Hoàn trả
                          </Button>
                        )}

                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 sm:flex-none'
                        onClick={() => setSelectedOrder(order)}
                      >
                        Xem chi tiết
                      </Button>

                      {['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.orderStatus) && (
                        <Button
                          size='sm'
                          className='flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white'
                          onClick={() => handleRepurchase(order)}
                          disabled={repurchasingId === order.id}
                        >
                          {repurchasingId === order.id && (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          )}
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

      {reviewingItem && (
        <CreateReviewModal
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          onSuccess={() => handleReviewSuccess(reviewingItem.orderDetailId)}
          orderDetailId={reviewingItem.orderDetailId}
          productName={reviewingItem.productName}
          variantName={reviewingItem.variantName}
          imageUrl={reviewingItem.imageUrl}
        />
      )}
    </div>
  )
}
