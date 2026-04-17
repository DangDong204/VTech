import { CreateVariantDialog } from '@/components/admin/data/manage-variant/create/CreateVariantDialog'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Định nghĩa Props với Generic Types chuẩn xác
interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  productId: string // Bổ sung prop riêng cho Variant
}

export function DataTable<TData, TValue>({
  data,
  columns,
  productId
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const { t } = useTranslation('variant')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  })

  // Kiểm tra xem có đang filter hay không
  const isFiltered = table.getState().columnFilters.length > 0

  // Hàm reset filter
  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
  }

  return (
    <>
      <div className='flex items-center gap-2 py-4'>
        {/* Lọc theo SKU */}
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('sku')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('sku')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />

        {/* Nút Reset Filter */}
        {isFiltered && (
          <Button size='default' className='h-8' onClick={handleResetFilters}>
            {/* TODO: Bổ sung file i18n */}
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          {/* Nút thêm mới Variant */}
          <CreateVariantDialog productId={productId} />
        </div>
      </div>

      <div className='overflow-hidden rounded-md border mb-5'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-center h-24'>
                  {t('table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </>
  )
}
