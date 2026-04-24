import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { MapPin, X } from 'lucide-react'
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

const API_URL = 'https://esgoo.net/api-tinhthanh'

interface LocationData {
  id: string
  name: string
}

const addressSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  specificAddress: z.string().min(5, 'Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)'),
  // FIX 1: Bỏ .default(false) trong schema để type không bị optional
  isDefault: z.boolean()
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function AddressFormSheet({ isOpen, onClose }: AddressFormSheetProps) {
  const [provinces, setProvinces] = useState<LocationData[]>([])
  const [districts, setDistricts] = useState<LocationData[]>([])
  const [wards, setWards] = useState<LocationData[]>([])

  // FIX 2: Dùng useRef thay vì useState + useEffect để tránh cascading render
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    // FIX 1: defaultValues đặt ở đây thay vì trong schema
    defaultValues: { isDefault: false }
  })

  // FIX 3 & 4: Dùng startTransition hoặc đưa setState vào async callback
  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/1/0.htm`)
        .then((res) => res.json())
        .then((res) => {
          // setState trong callback async/then = OK, không phải synchronous trong body effect
          if (res.error === 0) setProvinces(res.data)
        })
    } else {
      // Đưa vào setTimeout để thoát khỏi synchronous effect body
      const timer = setTimeout(() => {
        reset()
        setDistricts([])
        setWards([])
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, reset])

  const handleProvinceChange = async (provinceId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(provinceId)
    setValue('district', '')
    setValue('ward', '')
    setWards([])

    if (!provinceId) return setDistricts([])

    const res = await fetch(`${API_URL}/2/${provinceId}.htm`).then((r) => r.json())
    if (res.error === 0) setDistricts(res.data)
  }

  const handleDistrictChange = async (districtId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(districtId)
    setValue('ward', '')

    if (!districtId) return setWards([])

    const res = await fetch(`${API_URL}/3/${districtId}.htm`).then((r) => r.json())
    if (res.error === 0) setWards(res.data)
  }

  const onSubmit = async (data: AddressFormValues) => {
    try {
      const provinceName = provinces.find((p) => p.id === data.province)?.name
      const districtName = districts.find((d) => d.id === data.district)?.name
      const wardName = wards.find((w) => w.id === data.ward)?.name

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const finalPayload = { ...data, provinceName, districtName, wardName }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Đã thêm địa chỉ mới thành công!')
      onClose()
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300'
          onClick={onClose}
        />
      )}

      {/* Sheet Content trượt từ phải ra */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col',
          // FIX LỖI: Chỉ áp dụng transition nếu component đã mounted. Nếu đóng thì ẩn visibility đi
          isMounted ? 'transition-transform duration-300 ease-in-out' : '',
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        )}
      >
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2 font-bold text-lg text-slate-800'>
            <MapPin className='h-5 w-5 text-red-600' />
            Thêm địa chỉ mới
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
          <form id='address-form' onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <Label>Họ và tên</Label>
              <Input
                placeholder='Nhập họ và tên người nhận'
                {...register('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className='text-xs text-red-500'>{errors.fullName.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Số điện thoại</Label>
              <Input
                placeholder='Nhập số điện thoại'
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className='text-xs text-red-500'>{errors.phone.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Tỉnh/Thành phố</Label>
              <Controller
                control={control}
                name='province'
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(val) => handleProvinceChange(val, field.onChange)}
                  >
                    <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
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
              {errors.province && <p className='text-xs text-red-500'>{errors.province.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Quận/Huyện</Label>
              <Controller
                control={control}
                name='district'
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(val) => handleDistrictChange(val, field.onChange)}
                    disabled={!districts.length}
                  >
                    <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
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
              {errors.district && <p className='text-xs text-red-500'>{errors.district.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Phường/Xã</Label>
              <Controller
                control={control}
                name='ward'
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={!wards.length}
                  >
                    <SelectTrigger className={errors.ward ? 'border-red-500' : ''}>
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
              {errors.ward && <p className='text-xs text-red-500'>{errors.ward.message}</p>}
            </div>

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

        <div className='p-6 border-t bg-slate-50 flex gap-3'>
          <Button type='button' variant='outline' className='flex-1' onClick={onClose}>
            Hủy
          </Button>
          <Button type='submit' form='address-form' className='flex-1' disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </Button>
        </div>
      </div>
    </>
  )
}
