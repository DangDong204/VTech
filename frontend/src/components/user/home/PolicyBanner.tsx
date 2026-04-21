import { Truck, ShieldCheck, RefreshCcw, CreditCard, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PolicyItem {
  icon: LucideIcon
  titleKey: string
  subKey: string
}

const items: PolicyItem[] = [
  { icon: Truck, titleKey: 'policy.shipping.title', subKey: 'policy.shipping.sub' },
  { icon: ShieldCheck, titleKey: 'policy.warranty.title', subKey: 'policy.warranty.sub' },
  { icon: RefreshCcw, titleKey: 'policy.exchange.title', subKey: 'policy.exchange.sub' },
  { icon: CreditCard, titleKey: 'policy.installment.title', subKey: 'policy.installment.sub' }
]

export function PolicyBanner() {
  const { t } = useTranslation('common')
  return (
    <section className='bg-secondary/60 border border-border rounded-lg p-3 sm:p-4'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {items.map(({ icon: Icon, titleKey, subKey }) => (
          <div
            key={titleKey}
            className='flex items-start gap-3 p-2 sm:p-3 rounded-md hover:bg-background transition-colors'
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Icon className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <h4 className='text-sm font-semibold text-foreground leading-tight'>{t(titleKey)}</h4>
              <p className='mt-0.5 text-xs text-muted-foreground line-clamp-2'>{t(subKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
