import { ColorActionsCell } from '@/components/admin/action/ColorAction'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export type Color = {
  id: string
  colorName: string
  hexCode?: string
}

export const columns: ColumnDef<Color>[] = [
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
    accessorKey: 'colorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('color:table.columns.colorName')} />
    ),
    cell: ({ row }) => {
      const color = row.original

      return (
        <div className='flex items-center gap-3'>
          <div
            className='h-6 w-6 rounded-full border shadow-sm'
            style={{ backgroundColor: color.hexCode || '#ffffff' }}
            title={color.hexCode}
          />
          <span className='font-medium'>{color.colorName}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'hexCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('color:table.columns.hexCode')} />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground uppercase'>{row.original.hexCode || 'N/A'}</span>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-right pr-12'>{i18n.t('color:table.columns.actions')}</div>,
    cell: ({ row }) => <ColorActionsCell color={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
