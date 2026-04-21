import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

export function CheckoutForm() {
  const { t } = useTranslation('common')

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-bold'>{t('checkout.shippingInfo')}</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='fullName'>
            {t('checkout.fullName')} <span className='text-destructive'>*</span>
          </Label>
          <Input id='fullName' placeholder={t('checkout.fullNamePlaceholder')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phone'>
            {t('checkout.phone')} <span className='text-destructive'>*</span>
          </Label>
          <Input id='phone' type='tel' placeholder={t('checkout.phonePlaceholder')} />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>{t('checkout.email')}</Label>
        <Input id='email' type='email' placeholder={t('checkout.emailPlaceholder')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='address'>
          {t('checkout.address')} <span className='text-destructive'>*</span>
        </Label>
        <Input id='address' placeholder={t('checkout.addressPlaceholder')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='note'>{t('checkout.note')}</Label>
        <textarea
          id='note'
          className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          placeholder={t('checkout.notePlaceholder')}
        />
      </div>
    </div>
  )
}
