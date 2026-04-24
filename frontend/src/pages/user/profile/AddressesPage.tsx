import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { AddressFormSheet } from '@/pages/user/profile/AddressFormSheet'

const MOCK_ADDRESSES = [
  {
    id: 1,
    name: 'Nguyễn Đăng Đông',
    phone: '0987 654 321',
    address: 'Số nhà 10, Ngõ 1, Kiều Mai',
    ward: 'Phường Phúc Diễn',
    district: 'Quận Bắc Từ Liêm',
    city: 'Hà Nội',
    isDefault: true
  },
  {
    id: 2,
    name: 'Nguyễn Đăng Đông',
    phone: '0912 345 678',
    address: 'Đại học Công nghiệp Hà Nội',
    ward: 'Phường Minh Khai',
    district: 'Quận Bắc Từ Liêm',
    city: 'Hà Nội',
    isDefault: false
  }
]

export default function AddressesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl border border-border/50 shadow-sm gap-4'>
        <div>
          <h2 className='text-lg font-bold text-slate-800'>Sổ địa chỉ nhận hàng</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Quản lý thông tin địa chỉ giao hàng của bạn
          </p>
        </div>

        {/* Nút bấm mở Sheet Form */}
        <Button className='gap-2 shrink-0' onClick={() => setIsSheetOpen(true)}>
          <Plus className='h-4 w-4' /> Thêm địa chỉ mới
        </Button>
      </div>

      {/* Danh sách địa chỉ */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        {MOCK_ADDRESSES.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-xl border bg-white shadow-sm relative transition-all hover:shadow-md ${addr.isDefault ? 'border-red-300 ring-1 ring-red-100' : 'border-border'}`}
          >
            {addr.isDefault && (
              <Badge className='absolute top-4 right-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-50'>
                Mặc định
              </Badge>
            )}

            <div className='flex items-center gap-3 mb-3 pr-20'>
              <h3 className='font-bold text-slate-800'>{addr.name}</h3>
              <span className='w-1 h-1 rounded-full bg-slate-300'></span>
              <span className='text-slate-600 font-medium'>{addr.phone}</span>
            </div>

            <div className='text-sm text-slate-600 space-y-1 mb-5'>
              <p>{addr.address}</p>
              <p>
                {addr.ward}, {addr.district}, {addr.city}
              </p>
            </div>

            <div className='flex gap-3 pt-4 border-t border-slate-100'>
              <Button variant='outline' size='sm' className='flex-1 gap-2'>
                <Edit className='h-4 w-4' /> Cập nhật
              </Button>
              {!addr.isDefault && (
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100'
                >
                  <Trash2 className='h-4 w-4' /> Xóa
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Component chứa Form trượt từ phải sang */}
      <AddressFormSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </div>
  )
}
