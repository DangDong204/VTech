import { PromotionActionsCell } from '@/components/admin/action/PromotionAction'
import { PromotionStatusBadge } from '@/components/admin/data/manage-promotion/PromotionStatusBadge'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PromotionType } from '@/defines/enum/promotion.enum'
import i18n from '@/i18n/i18n'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowRight, Banknote, Calendar, Percent } from 'lucide-react'

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

// Cắt ngắn thời gian hiển thị (từ "21-04-2026 00:00:00" -> "21/04/2026")
const formatShortDate = (dateString?: string) => {
  if (!dateString) return '-'
  return dateString.split(' ')[0].replace(/-/g, '/')
}

export const columns: ColumnDef<PromotionResponse>[] = [
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
    id: 'promotionName',
    accessorKey: 'promotionName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.promotionName')}
      />
    ),
    cell: ({ row }) => {
      const p = row.original
      return (
        <div className='flex flex-col'>
          <span className='font-bold text-primary'>{p.promotionName}</span>
          {p.promotionDesc && (
            <span className='text-xs text-muted-foreground line-clamp-1' title={p.promotionDesc}>
              {p.promotionDesc}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('promotion:table.columns.type')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue<string>(columnId) === filterValue
    },
    cell: ({ row }) => {
      const type = row.original.discountType

      let label: string = type
      let colorClass: string = 'bg-gray-100 text-gray-800 border-gray-200'
      let Icon = Banknote

      if (type === PromotionType.PERCENTAGE) {
        label = i18n.t('promotion:filters.type.PERCENTAGE')
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
        Icon = Percent
      } else if (type === PromotionType.FIXED_AMOUNT) {
        label = i18n.t('promotion:filters.type.FIXED_AMOUNT')
        colorClass = 'bg-green-100 text-green-800 border-green-200'
        Icon = Banknote
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
        title={i18n.t('promotion:table.columns.discountValue')}
      />
    ),
    cell: ({ row }) => {
      const p = row.original
      if (p.discountType === PromotionType.PERCENTAGE) {
        return <span className='font-medium text-destructive'>{p.discountValue}%</span>
      }
      return <span className='font-medium text-destructive'>{formatVND(p.discountValue)}</span>
    }
  },
  {
    id: 'dates',
    header: () => (
      <div className='text-l whitespace-nowrap'>{i18n.t('promotion:table.columns.dates')}</div>
    ),
    cell: ({ row }) => {
      const p = row.original

      return (
        <div className='flex items-center gap-2 whitespace-nowrap'>
          <Calendar className='w-4 h-4 text-muted-foreground' />
          <div className='flex flex-col leading-tight'>
            <span className='text-sm font-medium text-foreground'>
              {formatShortDate(p.startDate)}
            </span>

            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <ArrowRight className='w-3 h-3' />
              {formatShortDate(p.endDate)}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('promotion:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => <PromotionStatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('promotion:table.columns.actions')}</div>,
    cell: ({ row }) => <PromotionActionsCell promotion={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
