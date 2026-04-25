import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { MapPin, X, Home, Briefcase, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import z from 'zod'
import type { AddressResponse } from '@/services/address/address.type'
import { createAddressApi, updateAddressApi } from '@/services/address/address.api'

const API_URL = 'https://esgoo.net/api-tinhthanh'

interface LocationData {
  id: string
  name: string
}

const addressSchema = z.object({
  recipientName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  provinceId: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  districtId: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  wardId: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  specificAddress: z.string().min(5, 'Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)'),
  addressType: z.enum(['HOME', 'OFFICE']),
  isDefault: z.boolean()
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormSheetProps {
  isOpen: boolean
  onClose: () => void
  editingAddress?: AddressResponse | null
  onSuccess?: (address: AddressResponse) => void
}

export function AddressFormSheet({
  isOpen,
  onClose,
  editingAddress,
  onSuccess
}: AddressFormSheetProps) {
  const [provinces, setProvinces] = useState<LocationData[]>([])
  const [districts, setDistricts] = useState<LocationData[]>([])
  const [wards, setWards] = useState<LocationData[]>([])

  // Trạng thái chờ load dữ liệu khi vào Mode Edit để giấu form đi tránh giật UI
  const [isInitializing, setIsInitializing] = useState(false)

  const isMounted = useRef(false)
  const isEditMode = !!editingAddress

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: '',
      phone: '',
      provinceId: '',
      districtId: '',
      wardId: '',
      specificAddress: '',
      addressType: 'HOME',
      isDefault: false
    }
  })

  // 1. Quản lý trạng thái Mount (tránh animation nhảy lần đầu)
  useEffect(() => {
    isMounted.current = true
  }, [])

  // 2. EFFECT DUY NHẤT XỬ LÝ KHỞI TẠO FORM VÀ LOAD LOCATION
  useEffect(() => {
    let isCancelled = false // Kỹ thuật dọn dẹp effect để tránh gọi API dư thừa khi user tắt form vội

    const initForm = async () => {
      if (!isOpen) {
        // Đóng form: Xóa dữ liệu sau 300ms (chờ animation tắt)
        const timer = setTimeout(() => {
          reset()
          setDistricts([])
          setWards([])
          setIsInitializing(false)
        }, 300)
        return () => clearTimeout(timer)
      }

      try {
        setIsInitializing(true)

        // Luôn fetch list Tỉnh
        const provRes = await fetch(`${API_URL}/1/0.htm`).then((r) => r.json())
        if (isCancelled) return
        if (provRes.error === 0) setProvinces(provRes.data)

        if (editingAddress) {
          // NẠP DỮ LIỆU CŨ LÊN FORM TRƯỚC
          reset({
            recipientName: editingAddress.recipientName,
            phone: editingAddress.phone,
            provinceId: editingAddress.provinceId,
            districtId: editingAddress.districtId,
            wardId: editingAddress.wardId,
            specificAddress: editingAddress.specificAddress,
            addressType: editingAddress.addressType,
            isDefault: editingAddress.isDefault
          })

          // FETCH DANH SÁCH HUYỆN & XÃ CHO TỈNH CŨ SONG SONG
          const [distRes, wardRes] = await Promise.all([
            fetch(`${API_URL}/2/${editingAddress.provinceId}.htm`).then((r) => r.json()),
            fetch(`${API_URL}/3/${editingAddress.districtId}.htm`).then((r) => r.json())
          ])

          if (isCancelled) return
          if (distRes.error === 0) setDistricts(distRes.data)
          if (wardRes.error === 0) setWards(wardRes.data)
        } else {
          // TẠO MỚI: Chỉ cần reset trắng Form
          reset({
            recipientName: '',
            phone: '',
            provinceId: '',
            districtId: '',
            wardId: '',
            specificAddress: '',
            addressType: 'HOME',
            isDefault: false
          })
          setDistricts([])
          setWards([])
        }
      } catch {
        // console.error('Lỗi nạp dữ liệu Tỉnh thành', error)
      } finally {
        if (!isCancelled) setIsInitializing(false)
      }
    }

    initForm()

    return () => {
      isCancelled = true
    }
  }, [isOpen, editingAddress, reset])

  // --- XỬ LÝ SỰ KIỆN KHI USER CHỌN TỈNH/HUYỆN MỚI ---
  const handleProvinceChange = async (provinceId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(provinceId)
    // Clear Huyện Xã
    setValue('districtId', '')
    setValue('wardId', '')
    setWards([])

    if (!provinceId) return setDistricts([])

    const res = await fetch(`${API_URL}/2/${provinceId}.htm`).then((r) => r.json())
    if (res.error === 0) setDistricts(res.data)
  }

  const handleDistrictChange = async (districtId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(districtId)
    // Clear Xã
    setValue('wardId', '')

    if (!districtId) return setWards([])

    const res = await fetch(`${API_URL}/3/${districtId}.htm`).then((r) => r.json())
    if (res.error === 0) setWards(res.data)
  }

  // --- NỘP FORM ---
  const onSubmit = async (data: AddressFormValues) => {
    try {
      const provinceName =
        provinces.find((p) => p.id === data.provinceId)?.name ?? editingAddress?.provinceName ?? ''
      const districtName =
        districts.find((d) => d.id === data.districtId)?.name ?? editingAddress?.districtName ?? ''
      const wardName =
        wards.find((w) => w.id === data.wardId)?.name ?? editingAddress?.wardName ?? ''

      const payload = {
        recipientName: data.recipientName,
        phone: data.phone,
        provinceId: data.provinceId,
        provinceName,
        districtId: data.districtId,
        districtName,
        wardId: data.wardId,
        wardName,
        specificAddress: data.specificAddress,
        addressType: data.addressType,
        isDefault: data.isDefault
      }

      let result: AddressResponse

      if (isEditMode && editingAddress) {
        result = await updateAddressApi(editingAddress.id, payload)
        toast.success('Cập nhật địa chỉ thành công!')
      } else {
        result = await createAddressApi(payload)
        toast.success('Đã thêm địa chỉ mới thành công!')
      }

      onSuccess?.(result)
      onClose()
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col',
          isMounted.current ? 'transition-transform duration-300 ease-in-out' : '',
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2 font-bold text-lg text-slate-800'>
            <MapPin className='h-5 w-5 text-red-600' />
            {isEditMode ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Loading Spinner khi đang nạp data cũ */}
        {isInitializing ? (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400'>
            <Loader2 className='h-8 w-8 animate-spin mb-4 text-slate-300' />
            <p className='text-sm font-medium'>Đang tải thông tin...</p>
          </div>
        ) : (
          /* Form body */
          <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
            <form id='address-form' onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              {/* Họ tên */}
              <div className='space-y-2'>
                <Label>Họ và tên</Label>
                <Input
                  placeholder='Nhập họ và tên người nhận'
                  {...register('recipientName')}
                  className={errors.recipientName ? 'border-red-500' : ''}
                />
                {errors.recipientName && (
                  <p className='text-xs text-red-500'>{errors.recipientName.message}</p>
                )}
              </div>

              {/* SĐT */}
              <div className='space-y-2'>
                <Label>Số điện thoại</Label>
                <Input
                  placeholder='Nhập số điện thoại'
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className='text-xs text-red-500'>{errors.phone.message}</p>}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className='space-y-2'>
                <Label>Tỉnh/Thành phố</Label>
                <Controller
                  control={control}
                  name='provinceId'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={(val) => handleProvinceChange(val, field.onChange)}
                    >
                      <SelectTrigger className={errors.provinceId ? 'border-red-500' : ''}>
                        <SelectValue placeholder='Chọn Tỉnh/Thành phố' />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.provinceId && (
                  <p className='text-xs text-red-500'>{errors.provinceId.message}</p>
                )}
              </div>

              {/* Quận/Huyện */}
              <div className='space-y-2'>
                <Label>Quận/Huyện</Label>
                <Controller
                  control={control}
                  name='districtId'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={(val) => handleDistrictChange(val, field.onChange)}
                      disabled={!districts.length}
                    >
                      <SelectTrigger className={errors.districtId ? 'border-red-500' : ''}>
                        <SelectValue placeholder='Chọn Quận/Huyện' />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.districtId && (
                  <p className='text-xs text-red-500'>{errors.districtId.message}</p>
                )}
              </div>

              {/* Phường/Xã */}
              <div className='space-y-2'>
                <Label>Phường/Xã</Label>
                <Controller
                  control={control}
                  name='wardId'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      disabled={!wards.length}
                    >
                      <SelectTrigger className={errors.wardId ? 'border-red-500' : ''}>
                        <SelectValue placeholder='Chọn Phường/Xã' />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.wardId && <p className='text-xs text-red-500'>{errors.wardId.message}</p>}
              </div>

              {/* Địa chỉ cụ thể */}
              <div className='space-y-2'>
                <Label>Địa chỉ cụ thể</Label>
                <Input
                  placeholder='Số nhà, Tên tòa nhà, Tên đường...'
                  {...register('specificAddress')}
                  className={errors.specificAddress ? 'border-red-500' : ''}
                />
                {errors.specificAddress && (
                  <p className='text-xs text-red-500'>{errors.specificAddress.message}</p>
                )}
              </div>

              {/* Loại địa chỉ */}
              <div className='space-y-2'>
                <Label>Loại địa chỉ</Label>
                <Controller
                  control={control}
                  name='addressType'
                  render={({ field }) => (
                    <div className='grid grid-cols-2 gap-3'>
                      <button
                        type='button'
                        onClick={() => field.onChange('HOME')}
                        className={cn(
                          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium',
                          field.value === 'HOME'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <Home
                          className={cn(
                            'h-4 w-4 shrink-0',
                            field.value === 'HOME' ? 'text-red-500' : 'text-slate-400'
                          )}
                        />
                        Nhà riêng
                      </button>

                      <button
                        type='button'
                        onClick={() => field.onChange('OFFICE')}
                        className={cn(
                          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium',
                          field.value === 'OFFICE'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <Briefcase
                          className={cn(
                            'h-4 w-4 shrink-0',
                            field.value === 'OFFICE' ? 'text-red-500' : 'text-slate-400'
                          )}
                        />
                        Văn phòng
                      </button>
                    </div>
                  )}
                />
              </div>

              {/* Đặt mặc định */}
              <div className='flex items-center gap-2 pt-2'>
                <input
                  type='checkbox'
                  id='isDefault'
                  className='w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500'
                  {...register('isDefault')}
                />
                <Label htmlFor='isDefault' className='font-normal cursor-pointer text-slate-600'>
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className='p-6 border-t bg-slate-50 flex gap-3'>
          <Button type='button' variant='outline' className='flex-1' onClick={onClose}>
            Hủy
          </Button>
          <Button
            type='submit'
            form='address-form'
            className='flex-1 bg-red-600 hover:bg-red-700 text-white'
            disabled={isSubmitting || isInitializing}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : isEditMode ? (
              'Cập nhật'
            ) : (
              'Lưu địa chỉ'
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
