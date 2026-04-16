import { colorMap } from '@/defines/colorMap'
import type { ProductStatus } from '@/defines/enum/product.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface ProductStatusBadgeProps {
  status?: ProductStatus
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const { t } = useTranslation('product')

  if (!status) return <span>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit',
        colorMap[status]
      )}
    >
      {t(`fields.status.options.${status}`, status)}
    </span>
  )
}
