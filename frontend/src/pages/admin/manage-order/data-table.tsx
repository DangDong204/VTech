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

// IMPORT SHADCN CALENDAR VÀ POPOVER
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // <-- IMPORT LOCALE TIẾNG VIỆT
import { type DateRange } from 'react-day-picker'

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
import { X, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '@/services/order/order.type'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
  'RETURNED'
]

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
  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
  }

  const { t, i18n } = useTranslation('order')

  // Xác định locale cho date-fns dựa trên ngôn ngữ hiện tại của i18next
  const currentLocale = i18n.language === 'vi' ? vi : undefined // undefined để dùng mặc định (Tiếng Anh)

  // Lấy giá trị filter hiện tại dưới dạng DateRange
  const dateFilter = (table.getColumn('createdAt')?.getFilterValue() as DateRange) || undefined

  return (
    <>
      {/* SỬ DỤNG GIAO DIỆN TƯƠNG TỰ PRODUCT:
        Sử dụng flex-wrap để có thể tự xuống dòng nếu bị hẹp.
      */}
      <div className='flex items-center flex-wrap gap-2 py-4'>
        {/* Ô Tìm kiếm */}
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('customer')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('customer')?.setFilterValue(event.target.value)}
          className='max-w-sm h-9'
        />

        {/* Lọc Trạng thái */}
        <Select
          value={(table.getColumn('orderStatus')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('orderStatus')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[160px] bg-white h-9'>
            <SelectValue placeholder={t('filters.status.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.status.all')}</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {/* ÉP KIỂU ĐỂ FIX LỖI TYPESCRIPT */}
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* BỘ LỌC KHOẢNG NGÀY SHADCN */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-[260px] justify-start text-left font-normal h-9 bg-white',
                !dateFilter?.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {dateFilter?.from ? (
                dateFilter.to ? (
                  <>
                    {format(dateFilter.from, 'dd/MM/yyyy')} - {format(dateFilter.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateFilter.from, 'dd/MM/yyyy')
                )
              ) : (
                <span>
                  {i18n.language === 'vi' ? 'Chọn khoảng ngày...' : 'Select date range...'}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          {/* Thêm class p-3 để tạo khoảng đệm, max-w-[100vw] overflow-x-auto để tránh vỡ layout trên mobile */}
          <PopoverContent className='w-auto p-3 max-w-[100vw] overflow-x-auto' align='start'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={dateFilter?.from}
              selected={dateFilter}
              onSelect={(range) => table.getColumn('createdAt')?.setFilterValue(range)}
              // Dùng 1 tháng trên màn hình nhỏ, 2 tháng trên màn hình lớn
              numberOfMonths={window.innerWidth > 768 ? 2 : 1}
              locale={currentLocale} // <-- ÁP DỤNG LOCALE Ở ĐÂY
              className='border-none'
            />
          </PopoverContent>
        </Popover>

        {/* Nút Đặt lại */}
        {isFiltered && (
          <Button size='default' className='h-9' onClick={handleResetFilters}>
            {t('filters.reset')} <X className='w-4 h-4 ml-1.5' />
          </Button>
        )}

        {/* Khối bên phải (Đẩy ViewOptions và các nút Create/Trash về bên phải) */}
        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className='overflow-hidden rounded-md border mb-5 bg-white'>
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
                <TableCell colSpan={columns.length} className='text-center py-10'>
                  {/* Ép kiểu cho translation */}
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
