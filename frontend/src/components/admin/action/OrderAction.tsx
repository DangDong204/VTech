import { useState } from 'react'
import { MoreHorizontal, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import type { OrderResponse } from '@/services/order/order.type'
import { UpdateOrderStatusDialog } from '../data/manage-order/UpdateOrderStatusDialog'
import { OrderDetailModal } from '@/pages/user/profile/OrderDetailModal' // Tái sử dụng Modal của Client (hoặc tạo riêng nếu muốn)

// Lưu ý: Cần import STATUS_MAP tương ứng với Client Modal
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

  // Chỉ hiện nút update nếu order nằm trong 3 trạng thái đầu
  const canUpdate = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)

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
