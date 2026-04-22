import { PromotionStatus } from '@/defines/enum/promotion.enum'
import { colorMap } from '@/defines/colorMap'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface PromotionStatusBadgeProps {
  status?: PromotionStatus
}

export function PromotionStatusBadge({ status }: PromotionStatusBadgeProps) {
  const { t } = useTranslation('promotion')

  if (!status) return <span>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit',
        colorMap[status]
      )}
    >
      {t(`filters.status.${status}`, status)}
    </span>
  )
}
