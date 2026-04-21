import { useTranslation } from 'react-i18next'
import { useCart } from '@/contexts/CartContext'
import { Separator } from '@/components/ui/separator'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export function OrderSummary() {
  const { t } = useTranslation('common')
  const { items, subtotal } = useCart()

  // Tạm thời fix cứng phí ship, sau này bạn có thể tính dựa trên địa chỉ
  const shippingFee = 30000
  const total = subtotal + shippingFee

  return (
    <div className='bg-card border border-border rounded-lg p-5'>
      <h2 className='text-lg font-bold mb-4'>{t('cart.summary')}</h2>

      {/* Danh sách sản phẩm mini */}
      <div className='space-y-4 max-h-[40vh] overflow-y-auto pr-2 pt-2'>
        {items.map((item) => (
          <div key={item.id} className='flex gap-3'>
            <div className='relative w-16 h-16 bg-white border border-border rounded-md p-1 shrink-0'>
              {item.image ? (
                <img src={item.image} alt={item.name} className='w-full h-full object-contain' />
              ) : (
                <div className='w-full h-full bg-muted rounded flex items-center justify-center text-xs'>
                  Ảnh
                </div>
              )}
              <span className='absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold'>
                {item.quantity}
              </span>
            </div>
            <div className='flex-1 text-sm'>
              <p className='font-medium line-clamp-2 leading-snug'>{item.name}</p>
              <p className='text-muted-foreground text-xs mt-1'>
                {item.variant?.storage} | {item.variant?.color}
              </p>
              <p className='font-bold text-foreground mt-1'>{formatVnd(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className='my-5' />

      {/* Tính toán chi phí */}
      <div className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>{t('cart.subtotal')}</span>
          <span className='font-medium'>{formatVnd(subtotal)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>{t('checkout.shippingFee')}</span>
          <span className='font-medium'>{formatVnd(shippingFee)}</span>
        </div>
      </div>

      <Separator className='my-5' />

      <div className='flex justify-between items-end'>
        <span className='font-medium text-foreground'>{t('cart.total')}</span>
        <span className='text-2xl font-extrabold text-primary'>{formatVnd(total)}</span>
      </div>
    </div>
  )
}
