import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { ProductStatusBadge } from '@/components/admin/data/manage-product/ProductStatusBadges'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { type ColumnDef } from '@tanstack/react-table'
import { VariantActionsCell } from '@/components/admin/action/VariantAction'

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export const columns: ColumnDef<ProductVariantResponse>[] = [
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
    id: 'combination',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('variant:table.columns.combination')} />
    ),
    cell: ({ row }) => {
      const variant = row.original
      return (
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 shrink-0 border rounded bg-slate-50 flex items-center justify-center overflow-hidden relative'>
            {variant.imageUrl ? (
              <img
                src={variant.imageUrl}
                alt={variant.sku}
                className='w-full h-full object-contain'
              />
            ) : (
              <span className='text-[10px] text-muted-foreground italic text-center leading-tight px-1'>
                Chưa có ảnh
              </span>
            )}
          </div>

          {/* Cột Tên - Màu sắc */}
          <div className='flex flex-col gap-1'>
            <span className='font-medium text-primary text-sm'>{variant.versionName}</span>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <div
                className='h-3 w-3 rounded-full border shadow-sm'
                style={{ backgroundColor: variant.hexCode }}
                title={variant.hexCode}
              />
              <span>{variant.colorName}</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('variant:table.columns.sku')} />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.sku}</span>
  },
  {
    id: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('variant:table.columns.price')} />
    ),
    cell: ({ row }) => {
      const { basePrice, salePrice } = row.original
      const isDiscounted = salePrice && salePrice < basePrice

      return (
        <div className='flex flex-col'>
          <span className='font-medium text-destructive'>{formatVND(salePrice || basePrice)}</span>
          {isDiscounted && (
            <span className='text-xs text-muted-foreground line-through'>
              {formatVND(basePrice)}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'stockQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('variant:table.columns.stock')} />
    ),
    cell: ({ row }) => {
      const stock = row.original.stockQuantity
      return <span className={stock === 0 ? 'text-destructive font-bold' : ''}>{stock}</span>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('variant:table.columns.status')} />
    ),
    cell: ({ row }) => <ProductStatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    header: () => <div className='text-right pr-4'>{i18n.t('variant:table.columns.actions')}</div>,
    cell: ({ row }) => <VariantActionsCell variant={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
