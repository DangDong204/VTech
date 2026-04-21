import { VoucherActionsCell } from '@/components/admin/action/VoucherAction'
import { VoucherStatusBadge } from '@/components/admin/data/manage-voucher/VoucherStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { VoucherType } from '@/defines/enum/voucher.enum'
import i18n from '@/i18n/i18n'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { type ColumnDef } from '@tanstack/react-table'
import { Banknote, Percent, Truck } from 'lucide-react' // THÊM ICON

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export const columns: ColumnDef<VoucherResponse>[] = [
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
    id: 'voucherCode',
    accessorKey: 'voucherCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('voucher:table.columns.voucherCode')} />
    ),
    cell: ({ row }) => {
      const v = row.original
      return (
        <div className='flex flex-col'>
          <span className='font-bold text-primary uppercase'>{v.voucherCode}</span>
          <span className='text-xs text-muted-foreground line-clamp-1' title={v.voucherName}>
            {v.voucherName}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('voucher:table.columns.type')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue<string>(columnId) === filterValue
    },
    cell: ({ row }) => {
      const type = row.original.type

      // Khai báo biến với kiểu dữ liệu mở rộng để tránh lỗi TypeScript
      let label: string = type
      let colorClass: string = 'bg-gray-100 text-gray-800 border-gray-200'
      let Icon = Banknote

      if (type === VoucherType.PERCENTAGE) {
        label = i18n.t('voucher:filters.type.PERCENTAGE')
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
        Icon = Percent
      } else if (type === VoucherType.FIXED_AMOUNT) {
        label = i18n.t('voucher:filters.type.FIXED_AMOUNT')
        colorClass = 'bg-green-100 text-green-800 border-green-200'
        Icon = Banknote
      } else if (type === VoucherType.FREE_SHIP) {
        label = i18n.t('voucher:filters.type.FREE_SHIP')
        colorClass = 'bg-purple-100 text-purple-800 border-purple-200'
        Icon = Truck
      }

      return (
        <Badge
          variant='outline'
          className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit ${colorClass}`}
        >
          <Icon className='w-3.5 h-3.5 mr-1' />
          <span className='hidden sm:inline'>{label}</span>
        </Badge>
      )
    }
  },
  {
    id: 'discountValue',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('voucher:table.columns.discountValue')}
      />
    ),
    cell: ({ row }) => {
      const v = row.original
      if (v.type === VoucherType.PERCENTAGE) {
        return (
          <div className='flex flex-col'>
            <span className='font-medium text-destructive'>{v.discountValue}%</span>
            {v.maxDiscountAmount && v.maxDiscountAmount > 0 && (
              <span className='text-[10px] text-muted-foreground'>
                Tối đa {formatVND(v.maxDiscountAmount)}
              </span>
            )}
          </div>
        )
      }
      return <span className='font-medium text-destructive'>{formatVND(v.discountValue)}</span>
    }
  },
  {
    accessorKey: 'minOrderValue',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('voucher:table.columns.minOrderValue')}
      />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground font-medium'>
        {formatVND(row.original.minOrderValue)}
      </span>
    )
  },
  {
    accessorKey: 'usageLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('voucher:table.columns.usage')} />
    ),
    cell: ({ row }) => {
      const v = row.original
      return (
        <div className='text-sm'>
          <span className='font-medium text-primary'>{v.usedCount}</span>
          <span className='text-muted-foreground'> / {v.usageLimit ? v.usageLimit : '∞'}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('voucher:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => <VoucherStatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('voucher:table.columns.actions')}</div>,
    cell: ({ row }) => <VoucherActionsCell voucher={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
