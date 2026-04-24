import { Truck, ShieldCheck, RefreshCcw, CreditCard, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Định nghĩa kiểu Union cứng để TypeScript và i18next nhận diện chính xác 100% key
type PolicyKey =
  | 'policy.shipping.title'
  | 'policy.shipping.sub'
  | 'policy.warranty.title'
  | 'policy.warranty.sub'
  | 'policy.exchange.title'
  | 'policy.exchange.sub'
  | 'policy.installment.title'
  | 'policy.installment.sub'

interface PolicyItem {
  icon: LucideIcon
  titleKey: PolicyKey
  subKey: PolicyKey
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
    <section className='bg-white border border-border shadow-sm rounded-xl p-4'>
      {/* Thêm divide-x để tạo đường kẻ vạch giữa các chính sách giống FPT Shop */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 sm:gap-y-6 sm:divide-x divide-border/50'>
        {items.map(({ icon: Icon, titleKey, subKey }) => (
          <div
            key={titleKey}
            className='flex items-center gap-3 px-2 sm:px-4 first:pl-2 lg:first:pl-4 cursor-default'
          >
            {/* Box Icon - FPT Theme: Màu sắc tĩnh, 1 tone Đỏ nổi bật, không hover */}
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600'>
              <Icon className='h-5 w-5' />
            </div>

            <div className='min-w-0 flex-1'>
              <h4 className='text-[14px] font-bold text-slate-800 leading-tight mb-1'>
                {/* Hàm t() giờ đây đã an toàn vì titleKey bị ép vào kiểu PolicyKey */}
                {t(titleKey)}
              </h4>
              <p className='text-[12px] text-slate-500 leading-snug line-clamp-2'>{t(subKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
