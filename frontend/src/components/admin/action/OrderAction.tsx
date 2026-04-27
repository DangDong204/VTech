import { useState } from 'react'
import { MoreHorizontal, Edit, Eye, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import type { OrderResponse } from '@/services/order/order.type'
import { UpdateOrderStatusDialog } from '../data/manage-order/UpdateOrderStatusDialog'
import { OrderDetailModal } from '@/pages/user/profile/OrderDetailModal'
import { exportInvoiceAdminApi } from '@/services/order/order.api'
import { toast } from 'sonner'

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả'
}

export function OrderActionsCell({ order }: { order: OrderResponse }) {
  const { t } = useTranslation('order')
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Điều kiện hiển thị nút cập nhật
  const canUpdate = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)

  // ĐIỀU KIỆN HIỂN THỊ NÚT XUẤT HÓA ĐƠN
  const canExportInvoice = ['CONFIRMED', 'PROCESSING'].includes(order.orderStatus)

  const handleExportInvoice = async () => {
    try {
      setIsExporting(true)
      toast.info('Đang tạo hóa đơn, vui lòng đợi...')
      await exportInvoiceAdminApi(order.id, order.orderCode)
      toast.success('Xuất hóa đơn thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi xuất hóa đơn!')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
            <Eye className='mr-2 h-4 w-4 text-blue-500' />
            {t('actions.view')}
          </DropdownMenuItem>

          {canUpdate && (
            <DropdownMenuItem onClick={() => setIsUpdateOpen(true)}>
              <Edit className='mr-2 h-4 w-4 text-amber-500' />
              {t('actions.updateStatus')}
            </DropdownMenuItem>
          )}

          {/* CHỈ HIỂN THỊ NÚT XUẤT HÓA ĐƠN KHI THỎA MÃN ĐIỀU KIỆN */}
          {canExportInvoice && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportInvoice} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className='mr-2 h-4 w-4 text-emerald-600 animate-spin' />
                ) : (
                  <Printer className='mr-2 h-4 w-4 text-emerald-600' />
                )}
                <span className={isExporting ? 'text-slate-500' : 'text-slate-700'}>
                  {t('actions.exportInvoice')}
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateOrderStatusDialog
        order={order}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
      />

      <OrderDetailModal
        order={order}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        statusMap={STATUS_MAP}
      />
    </>
  )
}
