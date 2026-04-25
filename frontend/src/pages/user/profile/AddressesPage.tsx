import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Star, Home, Briefcase, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AddressFormSheet } from '@/pages/user/profile/AddressFormSheet'
import {
  getMyAddressesApi,
  setDefaultAddressApi,
  deleteAddressApi
} from '@/services/address/address.api'
import type { AddressResponse } from '@/services/address/address.type'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  // ---------- Fetch danh sách ----------
  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      const data = await getMyAddressesApi()
      setAddresses(data)
    } catch {
      toast.error('Không thể tải danh sách địa chỉ, vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  // ---------- Mở form tạo mới ----------
  const handleOpenCreate = () => {
    setEditingAddress(null)
    setIsSheetOpen(true)
  }

  // ---------- Mở form chỉnh sửa ----------
  const handleOpenEdit = (address: AddressResponse) => {
    setEditingAddress(address)
    setIsSheetOpen(true)
  }

  // ---------- Đóng sheet ----------
  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    // editingAddress sẽ được reset sau animation (xử lý trong sheet)
  }

  // ---------- Callback sau khi lưu thành công ----------
  const handleSuccess = (saved: AddressResponse) => {
    setAddresses((prev) => {
      // Nếu địa chỉ mới/vừa sửa là default → bỏ default các cái khác
      const updated = saved.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev]

      const existingIndex = updated.findIndex((a) => a.id === saved.id)
      if (existingIndex >= 0) {
        updated[existingIndex] = saved
        return updated
      }
      return [...updated, saved]
    })
  }

  // ---------- Đặt mặc định ----------
  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id)
      await setDefaultAddressApi(id)
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
      toast.success('Đã đặt làm địa chỉ mặc định!')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setSettingDefaultId(null)
    }
  }

  // ---------- Xoá ----------
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteAddressApi(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Đã xoá địa chỉ!')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setDeletingId(null)
    }
  }

  // ---------- Render ----------
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
        <Button className='gap-2 shrink-0' onClick={handleOpenCreate}>
          <Plus className='h-4 w-4' /> Thêm địa chỉ mới
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className='flex items-center justify-center py-16 text-slate-400'>
          <Loader2 className='h-6 w-6 animate-spin mr-2' />
          <span className='text-sm'>Đang tải địa chỉ...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addresses.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200'>
          <div className='w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
            <Home className='h-6 w-6 text-slate-400' />
          </div>
          <p className='font-medium text-slate-600'>Bạn chưa có địa chỉ nào</p>
          <p className='text-sm mt-1 mb-4'>Thêm địa chỉ để đặt hàng nhanh hơn</p>
          <Button size='sm' className='gap-2' onClick={handleOpenCreate}>
            <Plus className='h-4 w-4' /> Thêm ngay
          </Button>
        </div>
      )}

      {/* Danh sách địa chỉ */}
      {!isLoading && addresses.length > 0 && (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-xl border bg-white shadow-sm relative transition-all hover:shadow-md ${
                addr.isDefault ? 'border-red-300 ring-1 ring-red-100' : 'border-border'
              }`}
            >
              {/* Badge mặc định */}
              {addr.isDefault && (
                <Badge className='absolute top-4 right-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-50'>
                  Mặc định
                </Badge>
              )}

              {/* Tên + SĐT */}
              <div className='flex items-center gap-3 mb-2 pr-24'>
                <h3 className='font-bold text-slate-800'>{addr.recipientName}</h3>
                <span className='w-1 h-1 rounded-full bg-slate-300'></span>
                <span className='text-slate-600 font-medium'>{addr.phone}</span>
              </div>

              {/* Badge loại địa chỉ */}
              <div className='mb-3'>
                {addr.addressType === 'HOME' ? (
                  <span className='inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5'>
                    <Home className='h-3 w-3' /> Nhà riêng
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-0.5'>
                    <Briefcase className='h-3 w-3' /> Văn phòng
                  </span>
                )}
              </div>

              {/* Địa chỉ đầy đủ */}
              <div className='text-sm text-slate-600 space-y-0.5 mb-5'>
                <p>{addr.specificAddress}</p>
                <p>
                  {addr.wardName}, {addr.districtName}, {addr.provinceName}
                </p>
              </div>

              {/* Actions */}
              <div className='flex gap-2 pt-4 border-t border-slate-100 flex-wrap'>
                {/* Sửa */}
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 gap-1.5'
                  onClick={() => handleOpenEdit(addr)}
                >
                  <Edit className='h-3.5 w-3.5' /> Cập nhật
                </Button>

                {/* Đặt mặc định — chỉ hiện khi chưa mặc định */}
                {!addr.isDefault && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-100'
                    disabled={settingDefaultId === addr.id}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    {settingDefaultId === addr.id ? (
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <Star className='h-3.5 w-3.5' />
                    )}
                    Mặc định
                  </Button>
                )}

                {/* Xoá — chỉ hiện khi chưa mặc định */}
                {!addr.isDefault && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100'
                    disabled={deletingId === addr.id}
                    onClick={() => handleDelete(addr.id)}
                  >
                    {deletingId === addr.id ? (
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <Trash2 className='h-3.5 w-3.5' />
                    )}
                    Xoá
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet form dùng chung */}
      <AddressFormSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        editingAddress={editingAddress}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
