import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useCart } from '@/contexts/CartContext'
import type { CartItemResponse } from '@/services/cart/cart.type'

type ExtendedCartItem = CartItemResponse & {
  originalPrice?: number
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

// --- 1. CART ITEM ROW ---
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
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200'
      }`}
    >
      {/* NÚT XOÁ TRÊN MOBILE */}
      <button
        onClick={() => removeItem(item.id)}
        className='absolute right-3 top-3 sm:hidden p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors z-10'
      >
        <Trash2 className='h-4.5 w-4.5' />
      </button>

      {/* CỘT 1: CHECKBOX + ẢNH SẢN PHẨM */}
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

        {/* THÔNG TIN TRÊN MOBILE */}
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
            {item.originalPrice && item.originalPrice > item.price && (
              <span className='text-[11px] text-muted-foreground line-through mb-[2px] truncate'>
                {formatVnd(item.originalPrice)}
              </span>
            )}
          </div>
          {isOutOfStock && (
            <span className='text-[11px] text-red-500 flex items-center gap-1 mt-0.5'>
              <AlertCircle className='h-3 w-3 shrink-0' /> Chỉ còn {stock}
            </span>
          )}
        </div>
      </div>

      {/* CỘT 2: TÊN & BIẾN THỂ (Desktop) */}
      <div className='hidden sm:flex flex-1 flex-col gap-1.5 min-w-0 pr-4'>
        <Link
          to={`/product/${item.productSlug}`}
          className='text-base font-medium text-slate-800 line-clamp-2 break-words hover:text-blue-600 transition-colors'
          title={`${item.productName} ${item.versionName}`}
        >
          {item.productName} {item.versionName}
        </Link>

        <div className='flex items-center gap-1.5 text-sm text-slate-500 min-w-0'>
          <span
            className='w-4 h-4 rounded-full border border-slate-200 shadow-sm shrink-0'
            style={{ backgroundColor: item.colorHex || '#ccc' }}
          ></span>
          <span
            className='text-slate-700 font-medium truncate max-w-[160px]'
            title={item.colorName}
          >
            {item.colorName}
          </span>
        </div>
      </div>

      {/* CỘT 3: ĐƠN GIÁ (Desktop) */}
      <div className='hidden sm:flex flex-col items-end justify-center w-[120px] shrink-0'>
        <span className='text-base font-bold text-red-600'>{formatVnd(item.price)}</span>
        {item.originalPrice && item.originalPrice > item.price && (
          <span className='text-sm text-slate-400 line-through'>
            {formatVnd(item.originalPrice)}
          </span>
        )}
      </div>

      {/* CỘT 4: BỘ ĐẾM SỐ LƯỢNG (Đã sửa lỗi hiển thị input bị lệch) */}
      <div className='w-full sm:w-[130px] shrink-0 flex flex-col items-center justify-center mt-2 sm:mt-0'>
        <div className='w-full flex justify-between sm:justify-center items-center'>
          <span className='text-sm font-medium text-slate-700 sm:hidden ml-8'>Số lượng:</span>
          {/* Ép chiều cao cố định h-8 cho toàn bộ nhóm nút */}
          <div className='flex items-center h-8 border border-slate-300 rounded overflow-hidden bg-white'>
            <button
              className='h-full w-8 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors focus:outline-none'
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className='h-3.5 w-3.5' />
            </button>
            <div className='h-full w-[1px] bg-slate-300'></div>
            {/* Sử dụng [appearance:textfield] để xoá mũi tên mặc định, bỏ p-0 và đặt lại kích thước */}
            <input
              type='number'
              value={item.quantity}
              readOnly
              className='h-full w-10 text-center text-sm font-medium border-0 focus:ring-0 p-0 text-slate-700 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <div className='h-full w-[1px] bg-slate-300'></div>
            <button
              className='h-full w-8 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors focus:outline-none'
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isOutOfStock}
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Báo lỗi tồn kho trên Desktop */}
        <div className='hidden sm:flex mt-1 h-4 items-center justify-center w-full'>
          {isOutOfStock && (
            <span className='text-[11px] text-red-500 font-medium text-center w-full'>
              Chỉ còn {stock} sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* CỘT 5: THÀNH TIỀN (Desktop) */}
      <div className='hidden sm:flex flex-col items-end w-[130px] shrink-0'>
        <span className='text-base font-bold text-red-600'>
          {formatVnd(item.price * item.quantity)}
        </span>
      </div>

      {/* CỘT 6: NÚT XOÁ (Desktop) */}
      <div className='hidden sm:flex w-[40px] shrink-0 justify-end'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors'
          onClick={() => removeItem(item.id)}
          title='Xoá sản phẩm'
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

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [voucher, setVoucher] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState('')

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItemIds(items.map((item) => item.id))
    } else {
      setSelectedItemIds([])
    }
  }

  const handleToggleItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItemIds((prev) => [...prev, id])
    } else {
      setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?')) {
      await clear()
      setSelectedItemIds([])
      toast.success('Đã xóa toàn bộ giỏ hàng')
    }
  }

  const selectedSubtotal = useMemo(() => {
    return items
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items, selectedItemIds])

  const discount = appliedVoucher === 'VTECH10' ? Math.round(selectedSubtotal * 0.1) : 0
  const total = Math.max(0, selectedSubtotal - discount)

  const handleApplyVoucher = () => {
    if (selectedItemIds.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để áp dụng mã giảm giá')
      return
    }

    if (voucher.trim().toUpperCase() === 'VTECH10') {
      setAppliedVoucher('VTECH10')
      toast.success(t('cart.voucher.applied'))
    } else {
      setAppliedVoucher('')
      toast.error(t('cart.voucher.invalid'))
    }
  }

  const handleCheckout = () => {
    if (selectedItemIds.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm để thanh toán!')
      return
    }

    const selectedItemsToCheckout = items.filter((item) => selectedItemIds.includes(item.id))

    navigate('/checkout', {
      state: {
        selectedItems: selectedItemsToCheckout,
        discountAmount: discount,
        voucherCode: appliedVoucher
      }
    })
  }

  return (
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
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className='lg:col-span-8 space-y-4'>
            {/* Header giả của Table */}
            <div className='flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-600'>
              <div className='flex items-center w-auto'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className='data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-5 w-5 rounded'
                />
                <span className='ml-3'>Chọn tất cả</span>
              </div>

              <div className='hidden sm:block flex-1'></div>
              <div className='hidden sm:block w-[120px] text-right'>Đơn giá</div>
              <div className='hidden sm:block w-[130px] text-center'>Số lượng</div>
              <div className='hidden sm:block w-[130px] text-right'>Thành tiền</div>

              {/* Nút thùng rác tổng */}
              <div className='flex-1 sm:flex-none sm:w-[40px] flex justify-end'>
                <Button
                  variant='ghost'
                  size='icon'
                  disabled={!isAllSelected}
                  onClick={handleClearCart}
                  className='h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400'
                  title='Xoá toàn bộ giỏ hàng'
                >
                  <Trash2 className='h-5 w-5' />
                </Button>
              </div>
            </div>

            {/* Render items */}
            {items.map((it) => (
              <CartItemRow
                key={it.id}
                item={it}
                isSelected={selectedItemIds.includes(it.id)}
                onToggle={handleToggleItem}
              />
            ))}
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <aside className='lg:col-span-4'>
            <Card className='lg:sticky lg:top-24 border-slate-200 shadow-sm rounded-xl overflow-hidden'>
              <CardHeader className='pb-4 bg-slate-50/80 border-b border-slate-100'>
                <CardTitle className='text-lg font-bold text-slate-800'>
                  {t('cart.summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-5 pt-5'>
                <div className='space-y-2.5'>
                  <label className='text-sm font-medium text-slate-700 flex items-center gap-1.5'>
                    <Tag className='h-4 w-4 text-red-500' />
                    {t('cart.voucher.label')}
                  </label>
                  <div className='flex gap-2'>
                    <Input
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                      placeholder={t('cart.voucher.placeholder')}
                      className='h-10 border-slate-300 focus-visible:ring-red-500'
                    />
                    <Button
                      onClick={handleApplyVoucher}
                      variant='secondary'
                      className='h-10 font-semibold'
                    >
                      {t('cart.voucher.apply')}
                    </Button>
                  </div>
                </div>

                <Separator className='bg-slate-200' />

                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>{t('cart.subtotal')}</span>
                    <span className='font-bold text-slate-800'>{formatVnd(selectedSubtotal)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>{t('cart.shipping')}</span>
                    <span className='font-bold text-emerald-600'>{t('cart.free')}</span>
                  </div>
                  {discount > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-slate-500 font-medium'>{t('cart.discount')}</span>
                      <span className='font-bold text-red-600'>-{formatVnd(discount)}</span>
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
                    <span className='text-[11px] text-slate-400 font-medium'>
                      (Đã bao gồm VAT nếu có)
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={selectedItemIds.length === 0}
                  size='lg'
                  className='w-full text-base font-bold bg-red-600 hover:bg-red-700 h-12 rounded-xl shadow-md shadow-red-600/20 disabled:opacity-50 disabled:shadow-none'
                >
                  {t('cart.checkout')}{' '}
                  {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ''}
                </Button>

                <div className='flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-4'>
                  <ShieldCheck className='h-4 w-4 text-emerald-500' /> {t('cart.secure')}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
