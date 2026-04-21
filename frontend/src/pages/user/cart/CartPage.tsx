import { useState } from 'react'
import { Link } from 'react-router-dom' // Đã đổi sang react-router-dom
import { Minus, Plus, Trash2, ShoppingBag, ImageIcon, Tag, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart, type CartItem } from '@/contexts/CartContext'
import { toast } from 'sonner'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function CartItemRow({ item }: { item: CartItem }) {
  const { t } = useTranslation('common')
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className='flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg'>
      <div
        className='relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-md flex items-center justify-center overflow-hidden'
        style={{
          background: `linear-gradient(135deg, oklch(0.96 0.04 ${item.hue ?? 240}), oklch(0.9 0.07 ${item.hue ?? 240}))`
        }}
      >
        {/* <ImageIcon className='h-8 w-8 text-foreground/20' /> */}
        <img
          src={item.image}
          alt={item.name}
          className='h-full w-full object-contain group-hover:scale-105 transition-transform duration-300'
        />
      </div>

      <div className='flex-1 min-w-0 flex flex-col gap-1.5'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-sm sm:text-base font-medium text-foreground line-clamp-2 leading-snug'>
            {item.name}
          </h3>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>

        {item.variant && (
          <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground'>
            {item.variant.color && (
              <span>
                {t('cart.color')}: <span className='text-foreground'>{item.variant.color}</span>
              </span>
            )}
            {item.variant.storage && (
              <span>
                {t('cart.storage')}: <span className='text-foreground'>{item.variant.storage}</span>
              </span>
            )}
          </div>
        )}

        <div className='mt-auto flex items-center justify-between gap-2 flex-wrap'>
          <div className='flex items-center border border-border rounded-md'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-r-none'
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className='h-3.5 w-3.5' />
            </Button>
            <input
              type='number'
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
              className='h-8 w-12 text-center text-sm border-0 bg-transparent focus:outline-none [appearance:textfield]'
              min={1}
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-l-none'
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className='h-3.5 w-3.5' />
            </Button>
          </div>

          <div className='text-right'>
            <div className='text-base font-bold text-primary'>{formatVnd(item.price)}</div>
            {item.originalPrice && item.originalPrice > item.price && (
              <div className='text-xs text-muted-foreground line-through'>
                {formatVnd(item.originalPrice)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  const { t } = useTranslation('common')
  return (
    <div className='bg-card border border-border rounded-lg py-16 px-6 flex flex-col items-center text-center'>
      <div className='h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4'>
        <ShoppingBag className='h-10 w-10 text-muted-foreground' />
      </div>
      <h2 className='text-lg sm:text-xl font-bold text-foreground'>{t('cart.empty.title')}</h2>
      <p className='mt-2 text-sm text-muted-foreground max-w-sm'>{t('cart.empty.sub')}</p>
      <Button asChild className='mt-6'>
        <Link to='/'>{t('cart.empty.cta')}</Link>
      </Button>
    </div>
  )
}

// Đã gỡ Header, Footer và thẻ main bao quanh vì ClientLayout đã đảm nhiệm việc đó
export default function CartPage() {
  const { t } = useTranslation('common')
  const { items, totalCount, subtotal } = useCart()
  const [voucher, setVoucher] = useState('')
  const [discount, setDiscount] = useState(0)

  const applyVoucher = () => {
    if (voucher.trim().toUpperCase() === 'VTECH10') {
      setDiscount(Math.round(subtotal * 0.1))
      toast.success(t('cart.voucher.applied'))
    } else {
      setDiscount(0)
      toast.error(t('cart.voucher.invalid'))
    }
  }

  const total = Math.max(0, subtotal - discount)

  return (
    <div className='container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl'>
      <div className='mb-5 sm:mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
          {t('cart.title')}
          {items.length > 0 && (
            <span className='ml-2 text-base font-normal text-muted-foreground'>
              ({t('cart.itemCount', { count: totalCount })})
            </span>
          )}
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6'>
          <div className='lg:col-span-8 space-y-3'>
            {items.map((it) => (
              <CartItemRow key={it.id} item={it} />
            ))}
          </div>

          <aside className='lg:col-span-4'>
            <Card className='lg:sticky lg:top-20'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>{t('cart.summary')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-foreground flex items-center gap-1.5'>
                    <Tag className='h-3.5 w-3.5' />
                    {t('cart.voucher.label')}
                  </label>
                  <div className='flex gap-2'>
                    <Input
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                      placeholder={t('cart.voucher.placeholder')}
                      className='h-9'
                    />
                    <Button onClick={applyVoucher} variant='secondary' size='sm' className='h-9'>
                      {t('cart.voucher.apply')}
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('cart.subtotal')}</span>
                    <span className='font-medium text-foreground'>{formatVnd(subtotal)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('cart.shipping')}</span>
                    <span className='font-medium text-success'>{t('cart.free')}</span>
                  </div>
                  {discount > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('cart.discount')}</span>
                      <span className='font-medium text-success'>-{formatVnd(discount)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className='flex justify-between items-baseline'>
                  <span className='text-sm font-medium text-foreground'>{t('cart.total')}</span>
                  <span className='text-xl sm:text-2xl font-extrabold text-primary'>
                    {formatVnd(total)}
                  </span>
                </div>
                <Button asChild size='lg' className='w-full text-base font-semibold'>
                  <Link to='/checkout'>{t('cart.checkout')}</Link>
                </Button>
                <div className='flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground'>
                  <ShieldCheck className='h-3.5 w-3.5' /> {t('cart.secure')}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
