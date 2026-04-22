import { ReceiptStatus } from '@/defines/enum/receipt.enum'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ReceiptStatusBadgeProps {
  status?: ReceiptStatus
}

export function ReceiptStatusBadge({ status }: ReceiptStatusBadgeProps) {
  const { t } = useTranslation('receipt')

  if (!status) return <span>-</span>

  const getStatusConfig = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PENDING:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          Icon: Clock
        }
      case ReceiptStatus.COMPLETED:
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          Icon: CheckCircle2
        }
      case ReceiptStatus.CANCELLED:
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          Icon: XCircle
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          Icon: Clock
        }
    }
  }

  const { color, Icon } = getStatusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium w-fit border',
        color
      )}
    >
      <Icon className='w-3.5 h-3.5' />
      {t(`filters.status.${status}`)}
    </span>
  )
}
