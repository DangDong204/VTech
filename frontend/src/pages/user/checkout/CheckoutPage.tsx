import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  Wallet,
  CreditCard,
  Banknote,
  Loader2,
  Tag,
  X,
  Ticket,
  Truck,
  Check
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { getMyAddressesApi } from '@/services/address/address.api'
import { createOrderApi } from '@/services/order/order.api'
import { checkVoucherApi, getAllVoucherApi, getMyVouchersApi } from '@/services/voucher/voucher.api'
import { api } from '@/utils/axiosCustomize'
import type { AddressResponse } from '@/services/address/address.type'
import type { PaymentMethod as PaymentMethodType } from '@/services/order/order.type'
import { useCart } from '@/contexts/CartContext'
import type { CartItemResponse } from '@/services/cart/cart.type'

type AppliedVoucherType = {
  id: string
  code: string
  type: string
  amount: number
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function CheckoutPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()

  const selectedItems: CartItemResponse[] = location.state?.selectedItems || []
  const initialVouchers: AppliedVoucherType[] = location.state?.appliedVouchers || []

  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD')
  const [note, setNote] = useState('')
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [appliedVouchers, setAppliedVouchers] = useState<AppliedVoucherType[]>(initialVouchers)

  // POPUP STATE
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([])
  const [selectedVouchersInModal, setSelectedVouchersInModal] = useState<
    { code: string; type: string }[]
  >([])
  const [voucherInput, setVoucherInput] = useState('')
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false)

  const shippingFee = 30000

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        // GỌI SONG SONG 2 API: Lấy mã Public hệ thống & Lấy mã Private trong ví
        const [publicData, walletData] = await Promise.all([getAllVoucherApi(), getMyVouchersApi()])

        // Lọc các mã Public (Không yêu cầu điểm) và đang ACTIVE
        const publicVouchers = publicData.filter(
          (v) =>
            (v.status === 'ACTIVE' || !v.status) && (!v.requiredPoints || v.requiredPoints === 0)
        )

        // Gộp 2 mảng lại với nhau
        const allAvailable = [...publicVouchers, ...walletData]

        // Loại bỏ trùng lặp (Phòng trường hợp Backend trả về lỗi data)
        const uniqueVouchers = Array.from(new Map(allAvailable.map((v) => [v.id, v])).values())

        setAvailableVouchers(uniqueVouchers)
      } catch {
        toast.error('Lỗi tải voucher')
      }
    }
    fetchVouchers()
  }, [])

  useEffect(() => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm trước khi thanh toán.')
      navigate('/cart', { replace: true })
    }
  }, [selectedItems, navigate])

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getMyAddressesApi()
        setAddresses(data)
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

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  const productDiscount = useMemo(
    () => appliedVouchers.filter((v) => v.type !== 'FREE_SHIP').reduce((s, v) => s + v.amount, 0),
    [appliedVouchers]
  )
  const shippingDiscount = useMemo(
    () => appliedVouchers.filter((v) => v.type === 'FREE_SHIP').reduce((s, v) => s + v.amount, 0),
    [appliedVouchers]
  )
  const total = Math.max(0, subtotal + shippingFee - productDiscount - shippingDiscount)

  const openVoucherModal = () => {
    setSelectedVouchersInModal(appliedVouchers.map((v) => ({ code: v.code, type: v.type })))
    setIsVoucherModalOpen(true)
  }

  const toggleVoucher = (code: string, type: string) => {
    setSelectedVouchersInModal((prev) => {
      if (prev.some((v) => v.code === code)) return prev.filter((v) => v.code !== code)
      const isFreeShip = type === 'FREE_SHIP'
      const filtered = prev.filter((v) => (v.type === 'FREE_SHIP') !== isFreeShip)
      return [...filtered, { code, type }]
    })
  }

  const handleConfirmVouchers = async () => {
    setIsCheckingVoucher(true)
    try {
      const promises = selectedVouchersInModal.map((v) =>
        checkVoucherApi({
          voucherCode: v.code,
          subTotal: subtotal,
          shippingFee: shippingFee
        })
      )
      const results = await Promise.all(promises)
      setAppliedVouchers(
        results.map((r) => ({
          id: r.voucherId,
          code: r.voucherCode,
          type: r.type,
          amount: r.discountAmount
        }))
      )
      setIsVoucherModalOpen(false)
      if (results.length > 0) toast.success('Đã áp dụng mã ưu đãi thành công!')
    } catch {
      toast.error('Một số mã không hợp lệ hoặc đã hết hạn!')
    } finally {
      setIsCheckingVoucher(false)
    }
  }

  const handleApplyManualVoucher = async () => {
    if (!voucherInput.trim()) return
    setIsCheckingVoucher(true)
    try {
      const data = await checkVoucherApi({
        voucherCode: voucherInput.trim(),
        subTotal: subtotal,
        shippingFee: shippingFee
      })
      setAvailableVouchers((prev) => {
        if (!prev.find((v) => v.voucherCode === data.voucherCode)) {
          return [
            {
              id: data.voucherId,
              voucherCode: data.voucherCode,
              voucherName: 'Mã ưu đãi đặc quyền',
              type: data.type,
              discountValue: data.discountAmount,
              minOrderValue: 0,
              status: 'ACTIVE'
            },
            ...prev
          ]
        }
        return prev
      })
      toggleVoucher(data.voucherCode, data.type)
      setVoucherInput('')
      toast.success('Đã tìm thấy và chọn mã ưu đãi!')
    } catch {
      toast.error('Mã ưu đãi không hợp lệ.')
    } finally {
      setIsCheckingVoucher(false)
    }
  }

  const handleRemoveVoucher = (codeToRemove: string) => {
    setAppliedVouchers((prev) => prev.filter((v) => v.code !== codeToRemove))
  }

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
        cartDetailIds: selectedItems.map((item) => item.id),
        customerName: selectedAddress.recipientName,
        customerPhone: selectedAddress.phone,
        customerAddress: fullAddress,
        paymentMethod: paymentMethod,
        shippingFee: shippingFee,
        productDiscount: productDiscount,
        note: note,
        voucherIds: appliedVouchers.map((v) => v.id)
      }

      const newOrder = await createOrderApi(payload)
      await fetchCart()

      if (paymentMethod === 'VNPAY') {
        toast.loading('Đang kết nối tới cổng thanh toán VNPAY...')
        const res = await api.get(`/client/orders/${newOrder.id}/payment-url`)
        window.location.href = res.data.data
      } else {
        toast.success('Đặt hàng thành công!')
        navigate('/orders', { replace: true })
      }
    } catch {
      toast.error('Có lỗi xảy ra khi đặt hàng!')
      setIsSubmitting(false)
    }
  }

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

  const shippingVouchers = availableVouchers.filter((v) => v.type === 'FREE_SHIP')
  const discountVouchers = availableVouchers.filter((v) => v.type !== 'FREE_SHIP')

  const renderVoucherGroup = (
    vouchers: any[],
    title: string,
    Icon: any,
    colorClass: string,
    bgClass: string
  ) => {
    if (vouchers.length === 0) return null
    return (
      <div className='mb-6'>
        <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${colorClass}`}>
          <Icon className='w-5 h-5' /> {title}
        </h4>
        <div className='flex flex-col gap-3'>
          {vouchers.map((v) => {
            const isEligible = subtotal >= v.minOrderValue
            const isOutOfUsage = v.usageLimit != null && (v.usedCount || 0) >= v.usageLimit
            const isDisabled = !isEligible || isOutOfUsage || isCheckingVoucher
            const progressPercent = v.usageLimit
              ? Math.min(((v.usedCount || 0) / v.usageLimit) * 100, 100)
              : 0
            const isSelected = selectedVouchersInModal.some((sv) => sv.code === v.voucherCode)

            return (
              <div
                key={v.id}
                onClick={() => {
                  if (!isDisabled && !isCheckingVoucher) toggleVoucher(v.voucherCode, v.type)
                }}
                className={`flex border rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer ${isDisabled ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' : isSelected ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-white border-slate-200 hover:border-red-300'}`}
              >
                <div
                  className={`w-24 shrink-0 flex flex-col items-center justify-center p-2 text-white border-r border-dashed border-white/40 ${bgClass}`}
                >
                  <span className='text-[10px] font-medium uppercase mb-1 text-center leading-tight'>
                    {v.type === 'FREE_SHIP' ? 'Vận chuyển' : 'Giảm giá'}
                  </span>
                  <span className='text-lg font-extrabold text-center leading-tight'>
                    {v.type === 'PERCENTAGE' ? `${v.discountValue}%` : formatVnd(v.discountValue)}
                  </span>
                </div>

                <div className='flex-1 p-3 flex flex-col justify-center'>
                  <h5 className='font-bold text-slate-800 text-sm mb-0.5 line-clamp-1'>
                    {v.voucherName}
                  </h5>
                  <p className='text-xs text-slate-500 mb-2'>
                    Đơn tối thiểu {formatVnd(v.minOrderValue)}
                  </p>

                  {v.usageLimit ? (
                    <div className='mb-2'>
                      <div className='flex justify-between items-center text-[10px] font-medium text-slate-500 mb-1'>
                        <span>
                          Đã dùng {v.usedCount || 0}/{v.usageLimit}
                        </span>
                        {isOutOfUsage && <span className='text-red-500'>Hết mã</span>}
                      </div>
                      <div className='w-full h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${bgClass}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='mb-2 text-[10px] text-slate-500 font-medium'>
                      Số lượng: Không giới hạn
                    </div>
                  )}

                  <div className='flex items-center justify-between mt-auto pt-1'>
                    <span className='text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase'>
                      {v.voucherCode}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'}`}
                    >
                      {isSelected && <Check className='w-3 h-3 text-white' />}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (selectedItems.length === 0) return null

  return (
    <>
      <div className='min-h-screen bg-slate-50 pb-12 pt-6'>
        <div className='container mx-auto px-4 max-w-6xl'>
          <Link
            to='/cart'
            className='inline-flex items-center text-sm font-medium text-slate-500 hover:text-red-600 mb-6 transition-colors'
          >
            <ChevronLeft className='w-4 h-4 mr-1' /> Quay lại giỏ hàng
          </Link>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-7 space-y-6'>
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
                      <Link to='/addresses' className='text-blue-600 hover:underline'>
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

              <Card className='border-slate-200 shadow-sm'>
                <CardContent className='pt-6'>
                  <h3 className='font-bold text-slate-800 mb-3'>Ghi chú cho đơn hàng</h3>
                  <Textarea
                    placeholder='Nhập ghi chú (VD: Giao giờ hành chính...)'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className='resize-none border-slate-200 focus-visible:ring-red-500'
                    rows={3}
                  />
                </CardContent>
              </Card>

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

            <div className='lg:col-span-5'>
              <Card className='lg:sticky lg:top-24 border-slate-200 shadow-sm'>
                <CardHeader className='pb-4 border-b border-slate-100 bg-slate-50/50'>
                  <CardTitle className='text-lg font-bold text-slate-800'>
                    Đơn hàng của bạn
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-5'>
                  <div className='space-y-4 max-h-[35vh] overflow-y-auto pr-2 pb-4'>
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

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium text-slate-700 flex items-center gap-1.5'>
                        <Tag className='h-4 w-4 text-red-500' /> Khuyến mãi
                      </label>
                      <button
                        onClick={openVoucherModal}
                        className='text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors'
                      >
                        Chọn hoặc nhập mã
                      </button>
                    </div>

                    {appliedVouchers.length > 0 && (
                      <div className='flex flex-col gap-2 mt-2'>
                        {appliedVouchers.map((v) => (
                          <div
                            key={v.code}
                            className='flex items-center justify-between bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-sm'
                          >
                            <div className='flex flex-col'>
                              <span className='font-bold uppercase'>{v.code}</span>
                              <span className='text-[11px] opacity-80'>
                                Giảm {v.type === 'FREE_SHIP' ? 'phí vận chuyển' : 'tiền hàng'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveVoucher(v.code)}
                              className='p-1 hover:bg-red-200 rounded-full transition-colors'
                            >
                              <X className='w-4 h-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className='my-4 bg-slate-200' />

                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-500 font-medium'>Tạm tính</span>
                      <span className='font-bold text-slate-800'>{formatVnd(subtotal)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-500 font-medium'>Phí vận chuyển</span>
                      <span className='font-bold text-slate-800'>{formatVnd(shippingFee)}</span>
                    </div>

                    {productDiscount > 0 && (
                      <div className='flex justify-between text-red-600'>
                        <span className='font-medium'>Giảm giá sản phẩm</span>
                        <span className='font-bold'>-{formatVnd(productDiscount)}</span>
                      </div>
                    )}
                    {shippingDiscount > 0 && (
                      <div className='flex justify-between text-emerald-600'>
                        <span className='font-medium'>Giảm giá vận chuyển</span>
                        <span className='font-bold'>-{formatVnd(shippingDiscount)}</span>
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
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />{' '}
                        {paymentMethod === 'VNPAY' ? 'Đang chuyển hướng...' : 'Đang xử lý...'}
                      </>
                    ) : (
                      'ĐẶT HÀNG NGAY'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHỌN VOUCHER */}
      {isVoucherModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300'>
          <div className='bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]'>
            <div className='flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 shrink-0'>
              <h3 className='font-bold text-lg text-slate-800'>Chọn Voucher của VTech</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className='p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='p-4 sm:p-5 flex-1 overflow-y-auto bg-slate-50 scrollbar-thin'>
              <div className='flex gap-2 mb-6'>
                <Input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder='Mã voucher (nếu có)'
                  className='uppercase h-11 border-slate-300 focus-visible:ring-red-500'
                />
                <Button
                  onClick={handleApplyManualVoucher}
                  disabled={isCheckingVoucher || !voucherInput.trim()}
                  className='h-11 bg-slate-800 hover:bg-slate-900 w-24 font-bold'
                >
                  Tìm mã
                </Button>
              </div>

              {availableVouchers.length === 0 ? (
                <div className='text-center py-6 text-slate-500 text-sm'>
                  Hiện tại chưa có mã giảm giá nào.
                </div>
              ) : (
                <>
                  {renderVoucherGroup(
                    shippingVouchers,
                    'Mã Miễn Phí Vận Chuyển',
                    Truck,
                    'text-emerald-600',
                    'bg-emerald-500'
                  )}
                  {renderVoucherGroup(
                    discountVouchers,
                    'Mã Giảm Giá Sản Phẩm',
                    Ticket,
                    'text-red-600',
                    'bg-red-500'
                  )}
                </>
              )}
            </div>

            <div className='p-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0'>
              <div className='text-sm text-slate-600'>
                Đã chọn:{' '}
                <span className='font-bold text-red-600'>{selectedVouchersInModal.length}/2</span>
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='font-semibold'
                  onClick={() => setIsVoucherModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmVouchers}
                  disabled={isCheckingVoucher}
                  className='bg-red-600 hover:bg-red-700 font-bold px-6'
                >
                  {isCheckingVoucher ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
