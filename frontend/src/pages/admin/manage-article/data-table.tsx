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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { ArticleStatus } from '@/defines/enum/article.enum'
import { CreateArticleDialog } from '@/components/admin/data/manage-article/create/CreateArticleDialog'
import { TrashArticleDialog } from '@/components/admin/data/manage-article/trash/TrashArticleDialog'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('article')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // TỰ ĐỘNG PHÂN TRANG BẰNG CLIENT
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

  return (
    <>
      <div className='flex flex-wrap items-center justify-between gap-4 py-4'>
        {/* Nhóm bên trái: Tìm kiếm và Lọc */}
        <div className='flex flex-1 items-center gap-2'>
          <Input
            placeholder={t('filters.search')}
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='max-w-sm'
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
              {Object.values(ArticleStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`filters.status.${status}` as const)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button size='default' className='h-8' onClick={handleResetFilters}>
              Đặt lại <X className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Nhóm bên phải: Các nút thao tác */}
        <div className='flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          <CreateArticleDialog />
          <TrashArticleDialog />
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
