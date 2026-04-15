import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { ProductStatus } from '@/defines/enum/product.enum'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { ProductImageResponse, SpecificationResponse } from '@/services/product/product.type'
import { ProductStatusBadge } from '@/components/admin/data/manage-product/ProductStatusBadges'
import { ProductActionsCell } from '@/components/admin/action/ProductAction'

export type Product = {
  id: string
  productName: string
  slug: string
  productDesc?: string | null
  warrantyMonths?: number
  totalViews: number
  totalPurchases: number
  ratingAvg: number
  totalReviews: number
  categoryId?: string
  categoryName?: string
  brandId?: string
  brandName?: string
  tags?: string[]
  status: ProductStatus
  images?: ProductImageResponse
  specification?: SpecificationResponse
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const columns: ColumnDef<Product>[] = [
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
    id: 'product',
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('product:table.columns.product')} />
    ),
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className='flex items-center gap-3'>
          <img
            src={product.images?.thumbnail ?? IMGAE_NOT_FOUND}
            alt={product.productName}
            className='h-9 w-9 rounded-md object-cover border'
          />

          <div className='flex flex-col'>
            <span className='font-medium'>{product.productName}</span>
            <span className='text-xs text-muted-foreground'>{product.slug}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('product:table.columns.category')} />
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue) return true
      return row.getValue<string | null>(columnId) === filterValue
    }
  },
  {
    accessorKey: 'brandName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('product:table.columns.brand')} />
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue) return true
      return row.getValue<string | null>(columnId) === filterValue
    }
  },
  {
    accessorKey: 'totalPurchases',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('product:table.columns.purchases')} />
    ),
    cell: ({ row }) => {
      const purchases = row.getValue('totalPurchases') as number
      return <div className='text-center font-medium'>{purchases}</div>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('product:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string

      if (!filterValue) return true

      return status === filterValue
    },
    cell: ({ row }) => <ProductStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('product:table.columns.actions')}</div>,
    cell: ({ row }) => <ProductActionsCell product={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
