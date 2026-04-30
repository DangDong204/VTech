import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { ReviewResponse } from '@/services/review/review.type'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { ReviewActionsCell } from '@/components/admin/action/ReviewAction'
import {
  ReviewStatusBadge,
  ReviewReplyStatusBadge
} from '@/components/admin/data/manage-review/ReviewStatusBadges'

export const columns: ColumnDef<ReviewResponse>[] = [
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
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.customer')} />
    ),
    cell: ({ row }) => {
      const review = row.original
      return (
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 shrink-0 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border'>
            <img
              src={review.avatarUrl ?? 'https://ui.shadcn.com/avatars/02.png'}
              alt={review.fullName || 'Khách hàng'}
              className='h-full w-full object-cover'
            />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-sm'>{review.fullName || 'Khách hàng ẩn danh'}</span>
            <span className='text-xs text-muted-foreground'>
              {format(new Date(review.createdAt), 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const name = row.getValue<string>(id)
      return name ? name.toLowerCase().includes(value.toLowerCase()) : true
    }
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.product')} />
    ),
    cell: ({ row }) => {
      const review = row.original
      return (
        <div className='flex items-center gap-3 max-w-[220px]'>
          <div className='h-10 w-10 shrink-0 bg-white border rounded overflow-hidden flex items-center justify-center'>
            {review.productImage ? (
              <img src={review.productImage} alt='Product' className='h-full w-full object-cover' />
            ) : (
              <span className='text-[10px] text-muted-foreground italic text-center leading-tight px-1'>
                No ảnh
              </span>
            )}
          </div>
          <div className='flex flex-col overflow-hidden'>
            <span
              className='text-sm font-semibold text-blue-700 truncate'
              title={review.productName}
            >
              {review.productName || 'Sản phẩm không xác định'}
            </span>
            <span className='text-[11px] text-slate-500 truncate'>{review.variantName}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.rating')} />
    ),
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      return (
        <div className='flex items-center'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue || filterValue === 'all') return true
      return row.getValue<number>(columnId).toString() === filterValue
    }
  },
  {
    id: 'replyStatus',
    accessorKey: 'reply',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('review:filters.replyStatus.label')} />
    ),
    cell: ({ row }) => <ReviewReplyStatusBadge hasReply={!!row.original.reply} />,
    filterFn: (row, id, filterValue) => {
      if (filterValue === 'replied') return row.getValue(id) !== null
      if (filterValue === 'not_replied') return row.getValue(id) === null
      return true
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === 'all') return true
      return row.getValue(columnId) === filterValue
    },
    cell: ({ row }) => <ReviewStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('review:table.columns.actions')}</div>,
    cell: ({ row }) => <ReviewActionsCell review={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
