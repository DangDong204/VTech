import { CreateProductDialog } from '@/components/admin/data/manage-product/create/CreateProductDialog'
import { TrashProductDialog } from '@/components/admin/data/manage-product/trash/TrashProductDialog'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ProductStatus } from '@/defines/enum/product.enum'
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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

type ProductDataItem = {
  categoryName?: string
  brandName?: string
}

export function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

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

  const isFiltered = table.getState().columnFilters.length > 0

  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
  }

  const uniqueCategories = useMemo(() => {
    const categories = data
      .map((item) => (item as TData & ProductDataItem).categoryName)
      .filter(Boolean)
    return Array.from(new Set(categories))
  }, [data])

  const uniqueBrands = useMemo(() => {
    const brands = data.map((item) => (item as TData & ProductDataItem).brandName).filter(Boolean)
    return Array.from(new Set(brands))
  }, [data])

  const { t } = useTranslation('product')

  return (
    <>
      <div className='flex items-center gap-2 py-4'>
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('product')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('product')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <Select
          value={(table.getColumn('categoryName')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('categoryName')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filters.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.category')}</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category as string} value={category as string}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('brandName')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('brandName')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filters.brand')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.brand')}</SelectItem>
            {uniqueBrands.map((brand) => (
              <SelectItem key={brand as string} value={brand as string}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filters.status.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.status.all')}</SelectItem>
            {Object.values(ProductStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`fields.status.options.${status}` as const)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button size='default' className='h-8' onClick={handleResetFilters}>
            {t('filters.reset')}
            <X />
          </Button>
        )}

        <DataTableViewOptions table={table} />
        <CreateProductDialog />
        <TrashProductDialog />
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
                <TableCell colSpan={columns.length} className='text-center'>
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
