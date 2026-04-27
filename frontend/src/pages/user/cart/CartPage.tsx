import { Check, Minus, Plus, ShoppingBag, Tag, Ticket, Trash2, Truck, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import type { CartItemResponse } from '@/services/cart/cart.type'
import { checkVoucherApi, getAllVoucherApi } from '@/services/voucher/voucher.api'

type ExtendedCartItem = CartItemResponse & {
  originalPrice?: number
}

type AppliedVoucherType = {
  id: string
  code: string
  type: string
  amount: number
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function CartItemRow({
  item,
  isSelected,
  onToggle
}: {
  item: ExtendedCartItem
  isSelected: boolean
  onToggle: (id: string, checked: boolean) => void
}) {
  const { updateQuantity, removeItem } = useCart()
  const stock = item.stockQuantity ?? 999
  const isOutOfStock = item.quantity >= stock

  const handleUpdateQuantity = (newQty: number) => {
    if (newQty < 1) return
    if (newQty > stock) {
      toast.error(`Sản phẩm này chỉ còn ${stock} cái trong kho.`)
      updateQuantity(item.id, stock)
      return
    }
    updateQuantity(item.id, newQty)
  }

  return (
    <div
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${isSelected ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200'}`}
    >
      <button
        onClick={() => removeItem(item.id)}
        className='absolute right-3 top-3 sm:hidden p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors z-10'
      >
        <Trash2 className='h-4.5 w-4.5' />
      </button>
      <div className='flex items-center gap-3 w-full sm:w-auto min-w-0'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
          className='data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-5 w-5 rounded shrink-0'
        />
        <div className='relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg border border-slate-200 bg-white p-1'>
          <img
            src={item.imageUrl}
            alt={item.productName}
            className='h-full w-full object-contain'
          />
        </div>
        <div className='flex-1 sm:hidden flex flex-col gap-1 pr-6 min-w-0'>
          <h3 className='text-sm font-medium text-foreground line-clamp-2 break-words leading-snug'>
            {item.productName} {item.versionName}
          </h3>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 min-w-0'>
            <span className='shrink-0'>Màu:</span>
            <span
              className='w-3 h-3 rounded-full border border-slate-200 shadow-sm shrink-0'
              style={{ backgroundColor: item.colorHex || '#ccc' }}
            ></span>
            <span className='font-medium text-slate-700 truncate'>{item.colorName}</span>
          </div>
          <div className='flex flex-wrap items-end gap-1.5 mt-1'>
            <span className='font-bold text-red-600'>{formatVnd(item.price)}</span>
          </div>
        </div>
      </div>
      <div className='hidden sm:flex flex-1 flex-col gap-1.5 min-w-0 pr-4'>
        <Link
          to={`/product/${item.productSlug}`}
          className='text-base font-medium text-slate-800 line-clamp-2 break-words hover:text-blue-600 transition-colors'
        >
          {item.productName} {item.versionName}
        </Link>
        <div className='flex items-center gap-1.5 text-sm text-slate-500 min-w-0'>
          <span
            className='w-4 h-4 rounded-full border border-slate-200 shadow-sm shrink-0'
            style={{ backgroundColor: item.colorHex || '#ccc' }}
          ></span>
          <span className='text-slate-700 font-medium truncate max-w-[160px]'>
            {item.colorName}
          </span>
        </div>
      </div>
      <div className='hidden sm:flex flex-col items-end justify-center w-[120px] shrink-0'>
        <span className='text-base font-bold text-red-600'>{formatVnd(item.price)}</span>
      </div>
      <div className='w-full sm:w-[130px] shrink-0 flex flex-col items-center justify-center mt-2 sm:mt-0'>
        <div className='w-full flex justify-between sm:justify-center items-center'>
          <span className='text-sm font-medium text-slate-700 sm:hidden ml-8'>Số lượng:</span>
          <div className='flex items-center h-8 border border-slate-300 rounded overflow-hidden bg-white'>
            <button
              className='h-full w-8 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors'
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className='h-3.5 w-3.5' />
            </button>
            <div className='h-full w-[1px] bg-slate-300'></div>
            <input
              type='number'
              value={item.quantity}
              readOnly
              className='h-full w-10 text-center text-sm font-medium border-0 focus:ring-0 p-0 text-slate-700 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <div className='h-full w-[1px] bg-slate-300'></div>
            <button
              className='h-full w-8 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors'
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isOutOfStock}
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>
      </div>
      <div className='hidden sm:flex flex-col items-end w-[130px] shrink-0'>
        <span className='text-base font-bold text-red-600'>
          {formatVnd(item.price * item.quantity)}
        </span>
      </div>
      <div className='hidden sm:flex w-[40px] shrink-0 justify-end'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors'
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className='h-5 w-5' />
        </Button>
      </div>
    </div>
  )
}

function EmptyCart() {
  const { t } = useTranslation('common')
  return (
    <div className='bg-white border border-slate-200 rounded-xl py-20 px-6 flex flex-col items-center text-center shadow-sm'>
      <div className='h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6'>
        <ShoppingBag className='h-12 w-12 text-slate-300' />
      </div>
      <h2 className='text-xl sm:text-2xl font-bold text-slate-800'>{t('cart.empty.title')}</h2>
      <p className='mt-2 text-base text-slate-500 max-w-sm'>{t('cart.empty.sub')}</p>
      <Button asChild size='lg' className='mt-8 px-8 font-semibold text-base rounded-full'>
        <Link to='/products'>{t('cart.empty.cta')}</Link>
      </Button>
    </div>
  )
}

export default function CartPage() {
  const { t } = useTranslation('common')
  const { items, totalCount, clear } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [appliedVouchers, setAppliedVouchers] = useState<AppliedVoucherType[]>([])

  // POPUP STATE
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([])

  // STATE CHỌN TRONG POPUP
  const [selectedVouchersInModal, setSelectedVouchersInModal] = useState<
    { code: string; type: string }[]
  >([])
  const [voucherInput, setVoucherInput] = useState('')
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false)

  const shippingFee = 30000
  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await getAllVoucherApi()
        setAvailableVouchers(data.filter((v) => v.status === 'ACTIVE' || !v.status))
      } catch {
        toast.error('Không thể tải danh sách voucher')
      }
    }
    fetchVouchers()
  }, [])

  useEffect(() => {
    const repurchaseVariantIds = location.state?.repurchaseVariantIds
    if (repurchaseVariantIds && repurchaseVariantIds.length > 0 && items.length > 0) {
      const idsToSelect = items
        .filter((item) => repurchaseVariantIds.includes(item.variantId))
        .map((item) => item.id)
      if (idsToSelect.length > 0) {
        setTimeout(() => {
          setSelectedItemIds(idsToSelect)
          const state = { ...location.state }
          delete state.repurchaseVariantIds
          navigate(location.pathname, { replace: true, state })
        }, 0)
      }
    }
  }, [items, location, navigate])

  const selectedSubtotal = useMemo(() => {
    return items
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items, selectedItemIds])

  useEffect(() => {
    if (appliedVouchers.length > 0) {
      setAppliedVouchers([])
      toast.info('Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã giảm giá.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubtotal])

  const productDiscount = useMemo(
    () => appliedVouchers.filter((v) => v.type !== 'FREE_SHIP').reduce((s, v) => s + v.amount, 0),
    [appliedVouchers]
  )
  const shippingDiscount = useMemo(
    () => appliedVouchers.filter((v) => v.type === 'FREE_SHIP').reduce((s, v) => s + v.amount, 0),
    [appliedVouchers]
  )
  const total = Math.max(0, selectedSubtotal + shippingFee - productDiscount - shippingDiscount)

  const handleToggleSelectAll = (checked: boolean) =>
    checked ? setSelectedItemIds(items.map((i) => i.id)) : setSelectedItemIds([])
  const handleToggleItem = (id: string, checked: boolean) =>
    checked
      ? setSelectedItemIds((p) => [...p, id])
      : setSelectedItemIds((p) => p.filter((i) => i !== id))

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?')) {
      await clear()
      setSelectedItemIds([])
      toast.success('Đã xóa toàn bộ giỏ hàng')
    }
  }

  // MỞ MODAL & COPY STATE
  const openVoucherModal = () => {
    if (selectedItemIds.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 sản phẩm trước khi áp dụng mã.')
      return
    }
    setSelectedVouchersInModal(appliedVouchers.map((v) => ({ code: v.code, type: v.type })))
    setIsVoucherModalOpen(true)
  }

  // TOGGLE VOUCHER TRONG MODAL
  const toggleVoucher = (code: string, type: string) => {
    setSelectedVouchersInModal((prev) => {
      // Nếu đã có -> bỏ chọn
      if (prev.some((v) => v.code === code)) {
        return prev.filter((v) => v.code !== code)
      }
      // Nếu chưa có -> thêm vào, đồng thời ghi đè mã cùng loại
      const isFreeShip = type === 'FREE_SHIP'
      const filtered = prev.filter((v) => (v.type === 'FREE_SHIP') !== isFreeShip)
      return [...filtered, { code, type }]
    })
  }

  // XÁC NHẬN TỪ MODAL
  const handleConfirmVouchers = async () => {
    setIsCheckingVoucher(true)
    try {
      const promises = selectedVouchersInModal.map((v) =>
        checkVoucherApi({
          voucherCode: v.code,
          subTotal: selectedSubtotal,
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

  // NHẬP TAY TRONG MODAL
  const handleApplyManualVoucher = async () => {
    if (!voucherInput.trim()) return
    setIsCheckingVoucher(true)
    try {
      const data = await checkVoucherApi({
        voucherCode: voucherInput.trim(),
        subTotal: selectedSubtotal,
        shippingFee: shippingFee
      })

      // Nếu là mã ẩn chưa có trong list, thêm giả vào list để hiển thị
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

  const handleCheckout = () => {
    if (selectedItemIds.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm để thanh toán!')
      return
    }
    const selectedItemsToCheckout = items.filter((item) => selectedItemIds.includes(item.id))
    navigate('/checkout', { state: { selectedItems: selectedItemsToCheckout, appliedVouchers } })
  }

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
            const isEligible = selectedSubtotal >= v.minOrderValue
            const isOutOfUsage = v.usageLimit != null && (v.usedCount || 0) >= v.usageLimit
            const isDisabled = !isEligible || isOutOfUsage
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

                    {/* CUSTOM RADIO/CHECKBOX */}
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

  return (
    <>
      <div className='container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-7xl bg-slate-50/50 min-h-screen'>
        <div className='mb-6 sm:mb-8 flex items-baseline gap-3'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
            {t('cart.title')}
          </h1>
          {items.length > 0 && (
            <span className='text-base font-medium text-slate-500'>
              ({t('cart.itemCount', { count: totalCount })})
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
            <div className='lg:col-span-8 space-y-4'>
              <div className='flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-600'>
                <div className='flex items-center w-auto'>
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleToggleSelectAll}
                    className='data-[state=checked]:bg-red-600 h-5 w-5 rounded'
                  />
                  <span className='ml-3'>Chọn tất cả</span>
                </div>
                <div className='hidden sm:block flex-1'></div>
                <div className='hidden sm:block w-[120px] text-right'>Đơn giá</div>
                <div className='hidden sm:block w-[130px] text-center'>Số lượng</div>
                <div className='hidden sm:block w-[130px] text-right'>Thành tiền</div>
                <div className='flex-1 sm:flex-none sm:w-[40px] flex justify-end'>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled={!isAllSelected}
                    onClick={handleClearCart}
                    className='h-9 w-9 text-slate-400 hover:text-red-500 disabled:opacity-30'
                  >
                    <Trash2 className='h-5 w-5' />
                  </Button>
                </div>
              </div>
              {items.map((it) => (
                <CartItemRow
                  key={it.id}
                  item={it}
                  isSelected={selectedItemIds.includes(it.id)}
                  onToggle={handleToggleItem}
                />
              ))}
            </div>

            <aside className='lg:col-span-4'>
              <Card className='lg:sticky lg:top-24 border-slate-200 shadow-sm rounded-xl overflow-hidden'>
                <CardHeader className='pb-4 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between'>
                  <CardTitle className='text-lg font-bold text-slate-800'>
                    {t('cart.summary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-5 pt-5'>
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

                  <Separator className='bg-slate-200' />

                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-500 font-medium'>{t('cart.subtotal')}</span>
                      <span className='font-bold text-slate-800'>
                        {formatVnd(selectedSubtotal)}
                      </span>
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

                  <Separator className='bg-slate-200' />

                  <div className='flex justify-between items-end pb-2'>
                    <span className='text-base font-bold text-slate-800'>{t('cart.total')}</span>
                    <div className='text-right'>
                      <span className='block text-2xl sm:text-3xl font-extrabold text-red-600 leading-none mb-1'>
                        {formatVnd(total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={selectedItemIds.length === 0}
                    size='lg'
                    className='w-full text-base font-bold bg-red-600 hover:bg-red-700 h-12 rounded-xl'
                  >
                    {t('cart.checkout')}{' '}
                    {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ''}
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>

      {/* MODAL CHỌN VOUCHER */}
      {isVoucherModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300'>
          <div className='bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 shrink-0'>
              <h3 className='font-bold text-lg text-slate-800'>Chọn Voucher của VTech</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className='p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Body */}
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

            {/* Footer */}
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
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
