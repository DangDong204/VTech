import { VersionActionsCell } from '@/components/admin/action/VersionAction'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import type { VersionResponse } from '@/services/version/version.type'
import { type ColumnDef } from '@tanstack/react-table'

export type Version = {
  id: string
  versionName: string
}

export const columns: ColumnDef<VersionResponse>[] = [
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
    accessorKey: 'versionName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('version:table.columns.versionName')} />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.versionName}</span>
  },
  {
    id: 'actions',
    header: () => <div className='text-right pr-4'>{i18n.t('version:table.columns.actions')}</div>,
    cell: ({ row }) => <VersionActionsCell version={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
