import { BrandActionsCell } from '@/components/admin/action/BrandAction'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { BrandStatus } from '@/defines/enum/brand.enum'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export type Brand = {
  id: string
  brandName: string
  slug: string
  brandDesc?: string | null
  brandLogo?: string | null
  displayOrder: number
  status: BrandStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const columns: ColumnDef<Brand>[] = [
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
    id: 'brand',
    accessorKey: 'brandName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('brand:table.columns.brand')} />
    ),
    cell: ({ row }) => {
      const brand = row.original

      return (
        <div className='flex items-center gap-3'>
          <img
            src={brand.brandLogo ?? IMGAE_NOT_FOUND}
            alt={brand.brandName}
            className='h-9 w-9 rounded-full object-cover border'
          />

          <div className='flex flex-col'>
            <span className='font-medium'>{brand.brandName}</span>
            <span className='text-xs text-muted-foreground'>{brand.slug}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'brandDesc',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('brand:table.columns.brandDesc')} />
    )
  },
  {
    accessorKey: 'displayOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('brand:table.columns.displayOrder')} />
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('brand:table.columns.actions')}</div>,
    cell: ({ row }) => <BrandActionsCell brand={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
