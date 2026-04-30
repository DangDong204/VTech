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

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
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
    state: { sorting, columnFilters, rowSelection }
  })

  const isFiltered = table.getState().columnFilters.length > 0
  const { t } = useTranslation('review')

  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
  }

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 py-4'>
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('fullName')?.setFilterValue(event.target.value)}
          className='w-[200px]'
        />

        <Input
          placeholder='Tìm sản phẩm...'
          value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('productName')?.setFilterValue(event.target.value)}
          className='w-[200px]'
        />

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder={t('filters.status.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.status.all')}</SelectItem>
            <SelectItem value='APPROVED'>{t('filters.status.APPROVED')}</SelectItem>
            <SelectItem value='PENDING'>{t('filters.status.PENDING')}</SelectItem>
            <SelectItem value='HIDDEN'>{t('filters.status.HIDDEN')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('rating')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('rating')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder={t('filters.rating.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.rating.all')}</SelectItem>
            <SelectItem value='5'>{t('filters.rating.5')}</SelectItem>
            <SelectItem value='4'>{t('filters.rating.4')}</SelectItem>
            <SelectItem value='3'>{t('filters.rating.3')}</SelectItem>
            <SelectItem value='2'>{t('filters.rating.2')}</SelectItem>
            <SelectItem value='1'>{t('filters.rating.1')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn('replyStatus')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('replyStatus')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filters.replyStatus.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.replyStatus.all')}</SelectItem>
            <SelectItem value='replied'>{t('filters.replyStatus.replied')}</SelectItem>
            <SelectItem value='not_replied'>{t('filters.replyStatus.not_replied')}</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant='ghost'
            size='default'
            className='h-10 px-2 lg:px-3'
            onClick={handleResetFilters}
          >
            {t('filters.reset')}
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
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
