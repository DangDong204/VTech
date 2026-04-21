import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Wallet, CreditCard, Banknote } from 'lucide-react'
import { useTranslation } from 'react-i18next' // THÊM IMPORT

export function PaymentMethod() {
  const { t } = useTranslation('common') // KHỞI TẠO HOOK
  const [method, setMethod] = useState('cod')

  const methods = [
    { id: 'cod', name: t('checkout.cod'), icon: <Banknote className='w-5 h-5' /> },
    { id: 'vnpay', name: t('checkout.vnpay'), icon: <Wallet className='w-5 h-5 text-blue-600' /> },
    {
      id: 'transfer',
      name: t('checkout.transfer'),
      icon: <CreditCard className='w-5 h-5 text-green-600' />
    }
  ]

  return (
    <div className='space-y-4 mt-8'>
      <h2 className='text-xl font-bold'>{t('checkout.paymentMethod')}</h2>

      <div className='space-y-3'>
        {methods.map((m) => (
          <div
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all',
              method === m.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                method === m.id ? 'border-primary' : 'border-muted-foreground'
              )}
            >
              {method === m.id && <div className='w-2 h-2 bg-primary rounded-full' />}
            </div>
            {m.icon}
            <span className='font-medium text-sm'>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
