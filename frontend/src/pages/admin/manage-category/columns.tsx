import { CategoryActionsCell } from '@/components/admin/action/CategoryAction'
import { CategoryStatusBadge } from '@/components/admin/data/manage-category/CategoryStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { CategoryStatus } from '@/defines/enum/category.enum'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export type Category = {
  id: string
  categoryName: string
  slug: string
  categoryDesc?: string | null
  thumbnailUrl?: string | null
  parentId?: string | null
  parentName?: string | null
  displayOrder: number
  status: CategoryStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const columns: ColumnDef<Category>[] = [
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
    id: 'category',
    accessorKey: 'categoryName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.category')} />
    ),
    cell: ({ row }) => {
      const category = row.original

      return (
        <div className='flex items-center gap-3'>
          <img
            src={category.thumbnailUrl ?? IMGAE_NOT_FOUND}
            alt={category.categoryName}
            className='h-9 w-9 rounded-full object-cover border'
          />

          <div className='flex flex-col'>
            <span className='font-medium'>{category.categoryName}</span>
            <span className='text-xs text-muted-foreground'>{category.slug}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'parentId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.parent')} />
    ),
    cell: ({ row }) => row.original.parentName,
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue) return true
      return row.getValue<string | null>(columnId) === filterValue
    }
  },
  {
    accessorKey: 'displayOrder',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('category:table.columns.displayOrder')}
      />
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string

      if (!filterValue) return true

      return status === filterValue
    },
    cell: ({ row }) => <CategoryStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('category:table.columns.actions')}</div>,
    cell: ({ row }) => <CategoryActionsCell category={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
