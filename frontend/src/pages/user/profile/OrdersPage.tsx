import { useState } from 'react'
import { Search, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const ORDER_TABS = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy']

// Mock Data
const MOCK_ORDERS = [
  {
    id: 'VTECH-2404-001',
    status: 'Đang giao',
    date: '24/04/2026',
    total: 34990000,
    items: [
      {
        name: 'iPhone 16 Pro Max',
        variant: '256GB - Titan Đen',
        qty: 1,
        price: 34990000,
        image:
          'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/iphone_16_pro_max_black_1_25ea9476ce.png'
      }
    ]
  },
  {
    id: 'VTECH-1002-089',
    status: 'Hoàn thành',
    date: '10/02/2026',
    total: 450000,
    items: [
      {
        name: 'Sạc nhanh Apple 20W Type-C',
        variant: 'Trắng',
        qty: 1,
        price: 450000,
        image:
          'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/sac_nhanh_apple_20w_type_c_1_d61a2db12f.png'
      }
    ]
  }
]

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')

  // Lọc đơn hàng theo tab
  const filteredOrders = MOCK_ORDERS.filter(
    (order) => activeTab === 'Tất cả' || order.status === activeTab
  )

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden'>
        {/* Tabs */}
        <div className='flex overflow-x-auto scrollbar-hide border-b'>
          {ORDER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-600 hover:text-red-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm */}
        <div className='p-4 bg-slate-50/50 border-b'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm theo mã đơn hàng, tên sản phẩm...'
              className='pl-9 bg-white border-slate-200'
            />
          </div>
        </div>

        {/* Danh sách đơn hàng */}
        <div className='flex flex-col gap-4 p-4'>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className='border rounded-xl bg-white overflow-hidden'>
                {/* Header đơn hàng */}
                <div className='flex items-center justify-between p-4 border-b bg-slate-50/50'>
                  <div className='flex items-center gap-4 text-sm'>
                    <span className='font-bold text-slate-800'>Mã ĐH: {order.id}</span>
                    <span className='text-slate-500 hidden sm:inline'>Ngày đặt: {order.date}</span>
                  </div>
                  <Badge
                    variant={order.status === 'Hoàn thành' ? 'default' : 'secondary'}
                    className={
                      order.status === 'Đang giao' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
                    }
                  >
                    {order.status}
                  </Badge>
                </div>

                {/* Body đơn hàng */}
                <div className='p-4'>
                  {order.items.map((item, idx) => (
                    <div key={idx} className='flex gap-4 mb-4 last:mb-0'>
                      <div className='h-20 w-20 shrink-0 border rounded-md overflow-hidden bg-white flex items-center justify-center p-2'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='max-h-full max-w-full object-contain'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-semibold text-slate-800 truncate'>
                          {item.name}
                        </h4>
                        <p className='text-xs text-slate-500 mt-1'>Phân loại: {item.variant}</p>
                        <p className='text-sm font-medium mt-1'>x{item.qty}</p>
                      </div>
                      <div className='text-right shrink-0'>
                        <span className='text-sm font-bold text-destructive'>
                          {formatVnd(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer đơn hàng */}
                <div className='p-4 border-t flex flex-wrap items-center justify-between gap-4 bg-slate-50/30'>
                  <div className='flex items-center gap-2'>
                    <Store className='h-4 w-4 text-slate-400' />
                    <span className='text-sm text-slate-600'>Thành tiền:</span>
                    <span className='text-lg font-bold text-destructive'>
                      {formatVnd(order.total)}
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Button variant='outline' size='sm'>
                      Xem chi tiết
                    </Button>
                    {order.status === 'Hoàn thành' && <Button size='sm'>Mua lại</Button>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='py-12 text-center'>
              <img
                src='/empty-cart.png'
                alt='Empty'
                className='h-24 mx-auto mb-4 opacity-50 grayscale'
              />
              <p className='text-slate-500'>Không có đơn hàng nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
