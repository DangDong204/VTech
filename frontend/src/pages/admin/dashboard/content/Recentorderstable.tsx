import { useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { recentOrders, type OrderStatus } from './dashboardData'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  'Hoàn thành': {
    label: 'Hoàn thành',
    className:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
  },
  'Đang giao': {
    label: 'Đang giao',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
  },
  'Chờ xác nhận': {
    label: 'Chờ xác nhận',
    className:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
  },
  'Đã huỷ': {
    label: 'Đã huỷ',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
  }
}

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN') + '₫'
}

export default function RecentOrdersTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = recentOrders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.product.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || order.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <Card className='border shadow-none'>
      <CardHeader className='flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <CardTitle className='text-base font-semibold'>Đơn hàng gần đây</CardTitle>
          <CardDescription className='mt-0.5 text-xs'>{filtered.length} đơn hàng</CardDescription>
        </div>
        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='h-8 w-48 pl-8 text-xs'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-8 w-38 text-xs'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all' className='text-xs'>
                Tất cả
              </SelectItem>
              <SelectItem value='Hoàn thành' className='text-xs'>
                Hoàn thành
              </SelectItem>
              <SelectItem value='Đang giao' className='text-xs'>
                Đang giao
              </SelectItem>
              <SelectItem value='Chờ xác nhận' className='text-xs'>
                Chờ xác nhận
              </SelectItem>
              <SelectItem value='Đã huỷ' className='text-xs'>
                Đã huỷ
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-9 pl-6 text-xs'>Mã đơn</TableHead>
              <TableHead className='h-9 text-xs'>Khách hàng</TableHead>
              <TableHead className='h-9 text-xs'>Sản phẩm</TableHead>
              <TableHead className='h-9 text-right text-xs'>Giá trị</TableHead>
              <TableHead className='h-9 text-xs'>Trạng thái</TableHead>
              <TableHead className='h-9 pr-6 text-right text-xs'>Ngày</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center text-sm text-muted-foreground'>
                  Không tìm thấy đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const config = statusConfig[order.status]
                return (
                  <TableRow key={order.id} className='text-sm'>
                    <TableCell className='pl-6 font-mono text-xs font-medium text-muted-foreground'>
                      {order.id}
                    </TableCell>
                    <TableCell className='font-medium'>{order.customer}</TableCell>
                    <TableCell className='max-w-[200px] truncate text-muted-foreground'>
                      {order.product}
                    </TableCell>
                    <TableCell className='text-right font-medium tabular-nums'>
                      {formatVND(order.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={`text-xs font-medium ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className='pr-6 text-right text-xs text-muted-foreground'>
                      {order.date}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
