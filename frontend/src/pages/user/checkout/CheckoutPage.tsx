import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CheckoutForm } from '@/pages/user/checkout/CheckoutForm'
import { PaymentMethod } from '@/pages/user/checkout/PaymentMethod'
import { OrderSummary } from '@/pages/user/checkout/OrderSummary'

export default function CheckoutPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { items, clear } = useCart()

  // Chặn khách vào trang checkout nếu không có gì trong giỏ
  useEffect(() => {
    if (items.length === 0) {
      toast.error(t('checkout.emptyCartError'))
      navigate('/cart')
    }
  }, [items, navigate])

  const handlePlaceOrder = () => {
    // TODO: Bắt sự kiện submit form, kiểm tra dữ liệu và gọi API tạo Order
    toast.success(t('checkout.orderSuccess'))
    clear() // Xóa giỏ hàng
    navigate('/') // Điều hướng về trang chủ hoặc trang "Thành công"
  }

  if (items.length === 0) return null // Tránh chớp màn hình trước khi redirect

  return (
    <div className='min-h-screen bg-muted/20 pb-12'>
      <div className='container mx-auto px-4 max-w-6xl pt-6'>
        <Link
          to='/cart'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors'
        >
          <ChevronLeft className='w-4 h-4 mr-1' />
          {t('checkout.backToCart')}
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* CỘT TRÁI: Form điền thông tin (Chiếm 7 phần) */}
          <div className='lg:col-span-7 space-y-6'>
            <div className='bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm'>
              <CheckoutForm />
              <PaymentMethod />
            </div>
          </div>

          {/* CỘT PHẢI: Tóm tắt đơn hàng & Nút đặt hàng (Chiếm 5 phần) */}
          <div className='lg:col-span-5'>
            <OrderSummary />

            <div className='mt-6 space-y-4'>
              <Button
                size='lg'
                className='w-full text-base font-bold h-14'
                onClick={handlePlaceOrder}
              >
                {t('checkout.placeOrder')}
              </Button>
              <div className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
                <ShieldCheck className='h-4 w-4' />
                {t('checkout.secureInfo')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
