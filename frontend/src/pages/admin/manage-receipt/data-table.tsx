import { CreateManualReceiptDialog } from '@/components/admin/data/manage-receipt/create/CreateManualReceiptDialog'
import { ImportExcelReceiptDialog } from '@/components/admin/data/manage-receipt/import/ImportExcelReceiptDialog'
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
import { ReceiptStatus } from '@/defines/enum/receipt.enum'
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  const isFiltered = table.getState().columnFilters.length > 0
  const { t } = useTranslation('receipt')

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 py-4'>
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('receiptCode')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('receiptCode')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />

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
            {Object.values(ReceiptStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`filters.status.${status}` as const)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button size='default' className='h-8' onClick={() => table.resetColumnFilters()}>
            {t('filters.reset')}
            <X className='w-4 h-4 ml-1' />
          </Button>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          <ImportExcelReceiptDialog />
          <CreateManualReceiptDialog />
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
                <TableRow key={row.id}>
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
