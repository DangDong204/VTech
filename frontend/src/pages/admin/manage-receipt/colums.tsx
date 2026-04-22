import { ReceiptActionsCell } from '@/components/admin/action/ReceiptActionsCell'
import { ReceiptStatusBadge } from '@/components/admin/data/manage-receipt/ReceiptStatusBadge'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import i18n from '@/i18n/i18n'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import { type ColumnDef } from '@tanstack/react-table'

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export const columns: ColumnDef<ReceiptResponse>[] = [
  {
    id: 'receiptCode',
    accessorKey: 'receiptCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('receipt:table.columns.receiptCode')} />
    ),
    cell: ({ row }) => <span className='font-bold text-primary'>{row.original.receiptCode}</span>
  },
  {
    id: 'supplierName',
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('receipt:table.columns.supplier')} />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.supplierName || 'N/A'}</span>
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('receipt:table.columns.totalAmount')} />
    ),
    cell: ({ row }) => (
      <span className='font-bold text-destructive'>{formatVND(row.original.totalAmount)}</span>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('receipt:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => <ReceiptStatusBadge status={row.original.status} />
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('receipt:table.columns.createdAt')} />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm'>{row.original.createdAt}</span>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('receipt:table.columns.actions')}</div>,
    cell: ({ row }) => <ReceiptActionsCell receipt={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
