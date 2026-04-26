import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  Wallet,
  CreditCard,
  Banknote,
  ShieldCheck,
  Loader2,
  Tag
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// API & Types
import { getMyAddressesApi } from '@/services/address/address.api'
import { createOrderApi } from '@/services/order/order.api'
import type { AddressResponse } from '@/services/address/address.type'
import type { PaymentMethod as PaymentMethodType } from '@/services/order/order.type'
import { useCart } from '@/contexts/CartContext'

// THÊM IMPORT TYPE CHO CART ITEM
import type { CartItemResponse } from '@/services/cart/cart.type'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function CheckoutPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Hứng dữ liệu từ trang Giỏ hàng
  const selectedItems: CartItemResponse[] = location.state?.selectedItems || []
  const initialDiscount = location.state?.discountAmount || 0
  const initialVoucherCode = location.state?.voucherCode || ''

  // 2. States cơ bản
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD')
  const [note, setNote] = useState('')
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 3. States cho Voucher
  const [voucherInput, setVoucherInput] = useState(initialVoucherCode)
  const [appliedVoucher, setAppliedVoucher] = useState(initialVoucherCode)
  const [discountAmount, setDiscountAmount] = useState(initialDiscount)

  // Nếu người dùng vào thẳng link /checkout mà không qua giỏ hàng -> Đá về giỏ hàng
  useEffect(() => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm trước khi thanh toán.')
      navigate('/cart', { replace: true })
    }
  }, [selectedItems, navigate])

  // Lấy danh sách địa chỉ giao hàng
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getMyAddressesApi()
        setAddresses(data)
        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddr = data.find((a) => a.isDefault) || data[0]
        if (defaultAddr) setSelectedAddressId(defaultAddr.id)
      } catch {
        toast.error('Không thể tải sổ địa chỉ.')
      } finally {
        setIsLoadingAddresses(false)
      }
    }
    fetchAddresses()
  }, [])

  // Tính toán tiền (Đã xóa ': any' vì selectedItems đã được định kiểu ở trên)
  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  const shippingFee = 0 // Tạm thời miễn phí ship
  const total = Math.max(0, subtotal + shippingFee - discountAmount)

  // Xử lý áp dụng mã giảm giá
  const handleApplyVoucher = () => {
    if (voucherInput.trim().toUpperCase() === 'VTECH10') {
      setAppliedVoucher('VTECH10')
      setDiscountAmount(Math.round(subtotal * 0.1))
      toast.success(t('cart.voucher.applied', 'Áp dụng mã giảm giá thành công!'))
    } else {
      setAppliedVoucher('')
      setDiscountAmount(0)
      toast.error(t('cart.voucher.invalid', 'Mã giảm giá không hợp lệ!'))
    }
  }

  // Xử lý Đặt hàng
  const { fetchCart } = useCart()

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ giao hàng!')
      return
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    if (!selectedAddress) return

    const fullAddress = `${selectedAddress.specificAddress}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.provinceName}`

    try {
      setIsSubmitting(true)
      const payload = {
        // Đã xóa ': any' ở đây
        cartDetailIds: selectedItems.map((item) => item.id),
        customerName: selectedAddress.recipientName,
        customerPhone: selectedAddress.phone,
        customerAddress: fullAddress,
        paymentMethod: paymentMethod,
        shippingFee: shippingFee,
        productDiscount: discountAmount,
        note: note,
        voucherIds: appliedVoucher ? [appliedVoucher] : [] // Gửi mã đã áp dụng thành công
      }

      await createOrderApi(payload)
      toast.success('Đặt hàng thành công!')

      // GỌI LẠI FETCH CART ĐỂ LÀM TƯƠI SỐ LƯỢNG TRÊN HEADER
      await fetchCart()

      navigate('/orders', { replace: true })
    } catch {
      toast.error('Có lỗi xảy ra khi đặt hàng!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Phương thức thanh toán UI
  const paymentMethodsList = [
    {
      id: 'COD' as PaymentMethodType,
      name: 'Thanh toán tiền mặt (COD)',
      icon: <Banknote className='w-6 h-6 text-emerald-600' />
    },
    {
      id: 'VNPAY' as PaymentMethodType,
      name: 'Thanh toán qua VNPAY',
      icon: <Wallet className='w-6 h-6 text-blue-600' />
    },
    {
      id: 'BANK_TRANSFER' as PaymentMethodType,
      name: 'Chuyển khoản ngân hàng',
      icon: <CreditCard className='w-6 h-6 text-violet-600' />
    }
  ]

  if (selectedItems.length === 0) return null

  return (
    <div className='min-h-screen bg-slate-50 pb-12 pt-6'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <Link
          to='/cart'
          className='inline-flex items-center text-sm font-medium text-slate-500 hover:text-red-600 mb-6 transition-colors'
        >
          <ChevronLeft className='w-4 h-4 mr-1' />
          Quay lại giỏ hàng
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* CỘT TRÁI: Thông tin khách hàng & Thanh toán */}
          <div className='lg:col-span-7 space-y-6'>
            {/* 1. Chọn địa chỉ */}
            <Card className='border-slate-200 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2 text-slate-800'>
                  <MapPin className='h-5 w-5 text-red-600' /> Địa chỉ nhận hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAddresses ? (
                  <div className='flex items-center gap-2 text-slate-500'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Đang tải địa chỉ...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className='text-slate-500 text-sm'>
                    Bạn chưa có địa chỉ nào.{' '}
                    <Link to='/profile/addresses' className='text-blue-600 hover:underline'>
                      Thêm địa chỉ mới
                    </Link>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={cn(
                          'flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all',
                          selectedAddressId === addr.id
                            ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500/20'
                            : 'border-slate-200 hover:border-red-300'
                        )}
                      >
                        <input
                          type='radio'
                          name='address'
                          className='mt-1 text-red-600 focus:ring-red-500 accent-red-600'
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-bold text-slate-800'>{addr.recipientName}</span>
                            <span className='text-slate-400'>|</span>
                            <span className='font-medium text-slate-700'>{addr.phone}</span>
                            {addr.isDefault && (
                              <span className='text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded ml-2'>
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-slate-600'>{addr.specificAddress}</p>
                          <p className='text-sm text-slate-600'>
                            {addr.wardName}, {addr.districtName}, {addr.provinceName}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Ghi chú */}
            <Card className='border-slate-200 shadow-sm'>
              <CardContent className='pt-6'>
                <h3 className='font-bold text-slate-800 mb-3'>Ghi chú cho đơn hàng</h3>
                <Textarea
                  placeholder='Nhập ghi chú (VD: Giao giờ hành chính, gọi trước khi giao...)'
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className='resize-none border-slate-200 focus-visible:ring-red-500'
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* 3. Phương thức thanh toán */}
            <Card className='border-slate-200 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-slate-800'>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {paymentMethodsList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all',
                        paymentMethod === m.id
                          ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500/20'
                          : 'border-slate-200 hover:border-red-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                          paymentMethod === m.id ? 'border-red-500' : 'border-slate-300'
                        )}
                      >
                        {paymentMethod === m.id && (
                          <div className='w-2.5 h-2.5 bg-red-500 rounded-full' />
                        )}
                      </div>
                      <div className='p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0'>
                        {m.icon}
                      </div>
                      <span className='font-medium text-slate-700'>{m.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: Tóm tắt đơn hàng */}
          <div className='lg:col-span-5'>
            <Card className='lg:sticky lg:top-24 border-slate-200 shadow-sm'>
              <CardHeader className='pb-4 border-b border-slate-100 bg-slate-50/50'>
                <CardTitle className='text-lg font-bold text-slate-800'>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent className='pt-5'>
                {/* Danh sách sản phẩm mini */}
                <div className='space-y-4 max-h-[35vh] overflow-y-auto pr-2 pb-4'>
                  {/* Đã xóa ': any' ở đây */}
                  {selectedItems.map((item) => (
                    <div key={item.id} className='flex gap-3'>
                      <div className='relative w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 shrink-0'>
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className='w-full h-full object-contain'
                        />
                        <span className='absolute -top-2 -right-2 bg-slate-500 text-white text-[11px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-bold'>
                          {item.quantity}
                        </span>
                      </div>
                      <div className='flex-1 text-sm min-w-0'>
                        <p className='font-medium text-slate-800 line-clamp-2 leading-snug'>
                          {item.productName} {item.versionName}
                        </p>
                        <p className='text-slate-500 text-xs mt-0.5 truncate'>
                          Màu: {item.colorName}
                        </p>
                        <p className='font-bold text-red-600 mt-1'>{formatVnd(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className='my-4 bg-slate-200' />

                {/* VOUCHER BOX MỚI THÊM */}
                <div className='space-y-2.5'>
                  <label className='text-sm font-medium text-slate-700 flex items-center gap-1.5'>
                    <Tag className='h-4 w-4 text-red-500' />
                    {t('cart.voucher.label', 'Mã giảm giá')}
                  </label>
                  <div className='flex gap-2'>
                    <Input
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder={t('cart.voucher.placeholder', 'Nhập mã giảm giá')}
                      className='h-10 border-slate-300 focus-visible:ring-red-500'
                    />
                    <Button
                      onClick={handleApplyVoucher}
                      variant='secondary'
                      className='h-10 font-semibold'
                    >
                      {t('cart.voucher.apply', 'Áp dụng')}
                    </Button>
                  </div>
                </div>

                <Separator className='my-4 bg-slate-200' />

                {/* Tính toán chi phí */}
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>Tạm tính</span>
                    <span className='font-bold text-slate-800'>{formatVnd(subtotal)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>Phí vận chuyển</span>
                    <span className='font-bold text-emerald-600'>Miễn phí</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-slate-500 font-medium'>Giảm giá Voucher</span>
                      <span className='font-bold text-red-600'>-{formatVnd(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <Separator className='my-4 bg-slate-200' />

                <div className='flex justify-between items-end pb-2'>
                  <span className='font-bold text-slate-800'>Tổng thanh toán</span>
                  <span className='text-2xl sm:text-3xl font-extrabold text-red-600'>
                    {formatVnd(total)}
                  </span>
                </div>

                <Button
                  size='lg'
                  disabled={isSubmitting || !selectedAddressId}
                  onClick={handlePlaceOrder}
                  className='w-full text-base font-bold bg-red-600 hover:bg-red-700 h-14 mt-4 rounded-xl shadow-md shadow-red-600/20'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Đang xử lý...
                    </>
                  ) : (
                    'ĐẶT HÀNG NGAY'
                  )}
                </Button>

                <div className='flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-4'>
                  <ShieldCheck className='h-4 w-4 text-emerald-500' /> Mọi thông tin đều được bảo
                  mật an toàn
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
