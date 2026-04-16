import { TagActionsCell } from '@/components/admin/action/TagAction'
import { TagStatusBadge } from '@/components/admin/data/manage-tag/TagStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { TagStatus } from '@/defines/enum/tag.enum'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export type Tag = {
  id: string
  tagName: string
  tagDesc?: string | null
  status: TagStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const columns: ColumnDef<Tag>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'tag',
    accessorKey: 'tagName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.tag')} />
    ),
    cell: ({ row }) => {
      const tag = row.original

      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{tag.tagName}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'tagDesc',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.tagDesc')} />
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.status')} />
    ),
    cell: ({ row }) => <TagStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('tag:table.columns.actions')}</div>,
    cell: ({ row }) => <TagActionsCell tag={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
