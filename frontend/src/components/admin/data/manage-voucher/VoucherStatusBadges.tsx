import { VoucherStatus } from '@/defines/enum/voucher.enum'
import { colorMap } from '@/defines/colorMap'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface VoucherStatusBadgeProps {
  status?: VoucherStatus
}

export function VoucherStatusBadge({ status }: VoucherStatusBadgeProps) {
  const { t } = useTranslation('voucher')

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
