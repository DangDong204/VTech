import { Badge } from '@/components/ui/badge'
import { type OrderStatus, type PaymentStatus } from '@/services/order/order.type'
import { useTranslation } from 'react-i18next'
import { Clock, CheckCircle, Package, Truck, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation('order')

  const getBadgeConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          className: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <Clock className='w-3 h-3 mr-1' />
        }
      case 'CONFIRMED':
        return {
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: <CheckCircle className='w-3 h-3 mr-1' />
        }
      case 'PROCESSING':
        return {
          className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          icon: <Package className='w-3 h-3 mr-1' />
        }
      case 'SHIPPING':
        return {
          className: 'bg-cyan-100 text-cyan-700 border-cyan-200',
          icon: <Truck className='w-3 h-3 mr-1' />
        }
      case 'DELIVERED':
        return {
          className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className='w-3 h-3 mr-1' />
        }
      case 'CANCELLED':
        return {
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: <XCircle className='w-3 h-3 mr-1' />
        }
      case 'RETURNED':
        return {
          className: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <RefreshCcw className='w-3 h-3 mr-1' />
        }
      default:
        return { className: 'bg-slate-100 text-slate-700', icon: null }
    }
  }

  const config = getBadgeConfig()

  return (
    <Badge variant='outline' className={`font-medium ${config.className}`}>
      {config.icon}
      {t(`status.${status}`)}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation('order')

  const getBadgeConfig = () => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'REFUNDED':
        return 'bg-slate-50 text-slate-600 border-slate-200'
      case 'FAILED':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  return (
    <Badge variant='outline' className={`font-medium ${getBadgeConfig()}`}>
      {t(`paymentStatus.${status}`)}
    </Badge>
  )
}
