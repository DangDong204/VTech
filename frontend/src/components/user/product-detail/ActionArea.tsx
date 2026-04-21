import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ActionAreaProps {
  onAddToCart: (quantity: number) => void
  onBuyNow: (quantity: number) => void
}

export function ActionArea({ onAddToCart, onBuyNow }: ActionAreaProps) {
  const { t } = useTranslation('common')
  const [quantity, setQuantity] = useState(1)

  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1))
  const handleIncrease = () => setQuantity((q) => q + 1)

  return (
    <div className='space-y-4 pt-4 border-t border-border mt-6'>
      <div className='flex items-center gap-4'>
        <span className='text-sm font-medium'>{t('productDetail.quantity')}</span>
        <div className='flex items-center border border-border rounded-md'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className='h-9 w-9 rounded-r-none'
          >
            <Minus className='h-4 w-4' />
          </Button>
          <input
            type='number'
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className='h-9 w-12 text-center text-sm border-0 focus:outline-none'
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={handleIncrease}
            className='h-9 w-9 rounded-l-none'
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <Button
          variant='outline'
          size='lg'
          className='flex-1 h-12 text-primary border-primary hover:bg-primary/5'
          onClick={() => onAddToCart(quantity)}
        >
          <ShoppingCart className='mr-2 h-5 w-5' />
          {t('product.addToCart')}
        </Button>
        <Button
          size='lg'
          className='flex-1 h-12 text-base font-bold'
          onClick={() => onBuyNow(quantity)}
        >
          {t('productDetail.buyNow')}
        </Button>
      </div>
    </div>
  )
}
