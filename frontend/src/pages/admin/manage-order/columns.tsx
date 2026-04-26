import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { OrderResponse } from '@/services/order/order.type'
import {
  OrderStatusBadge,
  PaymentStatusBadge
} from '@/components/admin/data/manage-order/OrderStatusBadges'
import { OrderActionsCell } from '@/components/admin/action/OrderAction'

export const columns: ColumnDef<OrderResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'orderCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.orderCode')} />
    ),
    cell: ({ row }) => <span className='font-bold text-slate-700'>{row.getValue('orderCode')}</span>
  },
  {
    id: 'customer',
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.customer')} />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{order.customerName}</span>
          <span className='text-xs text-muted-foreground'>{order.customerPhone}</span>
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue) return true
      const searchStr = filterValue.toLowerCase()
      return (
        row.original.orderCode.toLowerCase().includes(searchStr) ||
        row.original.customerPhone.includes(searchStr) ||
        row.original.customerName.toLowerCase().includes(searchStr)
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.createdAt')} />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <span>
          {date.toLocaleDateString('vi-VN')}{' '}
          {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    // ĐÃ SỬA LẠI KIỂU DỮ LIỆU THÀNH Date ĐỂ TƯƠNG THÍCH VỚI SHADCN CALENDAR
    filterFn: (row, columnId, filterValue: { from?: Date; to?: Date }) => {
      if (!filterValue || (!filterValue.from && !filterValue.to)) return true

      const rowDate = new Date(row.getValue(columnId)).getTime()

      let fromTime = 0
      if (filterValue.from) {
        const d = new Date(filterValue.from)
        d.setHours(0, 0, 0, 0)
        fromTime = d.getTime()
      }

      let toTime = Infinity
      if (filterValue.to) {
        const d = new Date(filterValue.to)
        d.setHours(23, 59, 59, 999)
        toTime = d.getTime()
      }

      return rowDate >= fromTime && rowDate <= toTime
    }
  },
  {
    accessorKey: 'finalPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.total')} />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('finalPrice'))
      const formatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
      return <span className='font-semibold text-red-600'>{formatted}</span>
    }
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.paymentStatus')} />
    ),
    cell: ({ row }) => <PaymentStatusBadge status={row.getValue('paymentStatus')} />
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.orderStatus')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => <OrderStatusBadge status={row.getValue('orderStatus')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('order:table.columns.actions')}</div>,
    cell: ({ row }) => <OrderActionsCell order={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
