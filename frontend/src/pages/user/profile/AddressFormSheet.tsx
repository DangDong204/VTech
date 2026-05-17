import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

const API_URL = 'https://esgoo.net/api-tinhthanh'

interface LocationData {
  id: string
  name: string
}

// Chuyển việc định nghĩa type ra ngoài thông qua 1 hàm lấy schema và gán type TFunction cho t
const getAddressSchema = (t: TFunction<'profile'>) =>
  z.object({
    recipientName: z
      .string()
      .min(2, t('address.form.validation.nameReq', 'Vui lòng nhập họ và tên')),
    phone: z
      .string()
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
        t('address.form.validation.phoneInv', 'Số điện thoại không hợp lệ')
      ),
    provinceId: z
      .string()
      .min(1, t('address.form.validation.provinceReq', 'Vui lòng chọn Tỉnh/Thành phố')),
    districtId: z
      .string()
      .min(1, t('address.form.validation.districtReq', 'Vui lòng chọn Quận/Huyện')),
    wardId: z.string().min(1, t('address.form.validation.wardReq', 'Vui lòng chọn Phường/Xã')),
    specificAddress: z
      .string()
      .min(5, t('address.form.validation.specificReq', 'Vui lòng nhập địa chỉ cụ thể')),
    addressType: z.enum(['HOME', 'OFFICE']),
    isDefault: z.boolean()
  })

type AddressFormValues = z.infer<ReturnType<typeof getAddressSchema>>

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
  const { t } = useTranslation('profile')
  const [provinces, setProvinces] = useState<LocationData[]>([])
  const [districts, setDistricts] = useState<LocationData[]>([])
  const [wards, setWards] = useState<LocationData[]>([])

  const [isInitializing, setIsInitializing] = useState(false)

  const isMounted = useRef(false)
  const isEditMode = !!editingAddress

  // Tạo schema bên trong Component để ăn theo i18n
  const addressSchema = useMemo(() => getAddressSchema(t), [t])

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

  // 2. EFFECT KHỞI TẠO FORM VÀ LOAD LOCATION
  useEffect(() => {
    let isCancelled = false

    const initForm = async () => {
      if (!isOpen) {
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
        const provRes = await fetch(`${API_URL}/1/0.htm`).then((r) => r.json())
        if (isCancelled) return
        if (provRes.error === 0) setProvinces(provRes.data)

        if (editingAddress) {
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

          const [distRes, wardRes] = await Promise.all([
            fetch(`${API_URL}/2/${editingAddress.provinceId}.htm`).then((r) => r.json()),
            fetch(`${API_URL}/3/${editingAddress.districtId}.htm`).then((r) => r.json())
          ])

          if (isCancelled) return
          if (distRes.error === 0) setDistricts(distRes.data)
          if (wardRes.error === 0) setWards(wardRes.data)
        } else {
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
        // Handle error
      } finally {
        if (!isCancelled) setIsInitializing(false)
      }
    }

    initForm()

    return () => {
      isCancelled = true
    }
  }, [isOpen, editingAddress, reset])

  const handleProvinceChange = async (provinceId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(provinceId)
    setValue('districtId', '')
    setValue('wardId', '')
    setWards([])

    if (!provinceId) return setDistricts([])

    const res = await fetch(`${API_URL}/2/${provinceId}.htm`).then((r) => r.json())
    if (res.error === 0) setDistricts(res.data)
  }

  const handleDistrictChange = async (districtId: string, onChangeForm: (val: string) => void) => {
    onChangeForm(districtId)
    setValue('wardId', '')

    if (!districtId) return setWards([])

    const res = await fetch(`${API_URL}/3/${districtId}.htm`).then((r) => r.json())
    if (res.error === 0) setWards(res.data)
  }

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
        toast.success(t('address.messages.updateSuccess', 'Cập nhật địa chỉ thành công!'))
      } else {
        result = await createAddressApi(payload)
        toast.success(t('address.messages.addSuccess', 'Đã thêm địa chỉ mới thành công!'))
      }

      onSuccess?.(result)
      onClose()
    } catch {
      toast.error(t('address.messages.generalError', 'Có lỗi xảy ra, vui lòng thử lại!'))
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col',
          isMounted.current ? 'transition-transform duration-300 ease-in-out' : '',
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        )}
      >
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2 font-bold text-lg text-slate-800'>
            <MapPin className='h-5 w-5 text-red-600' />
            {isEditMode
              ? t('address.form.titleEdit', 'Cập nhật địa chỉ')
              : t('address.form.titleAdd', 'Thêm địa chỉ mới')}
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {isInitializing ? (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400'>
            <Loader2 className='h-8 w-8 animate-spin mb-4 text-slate-300' />
            <p className='text-sm font-medium'>
              {t('address.form.loading', 'Đang tải thông tin...')}
            </p>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
            <form id='address-form' onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              {/* Họ tên */}
              <div className='space-y-2'>
                <Label>{t('address.form.fields.name.label', 'Họ và tên')}</Label>
                <Input
                  placeholder={t(
                    'address.form.fields.name.placeholder',
                    'Nhập họ và tên người nhận'
                  )}
                  {...register('recipientName')}
                  className={errors.recipientName ? 'border-red-500' : ''}
                />
                {errors.recipientName && (
                  <p className='text-xs text-red-500'>{errors.recipientName.message}</p>
                )}
              </div>

              {/* SĐT */}
              <div className='space-y-2'>
                <Label>{t('address.form.fields.phone.label', 'Số điện thoại')}</Label>
                <Input
                  placeholder={t('address.form.fields.phone.placeholder', 'Nhập số điện thoại')}
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className='text-xs text-red-500'>{errors.phone.message}</p>}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className='space-y-2'>
                <Label>{t('address.form.fields.province.label', 'Tỉnh/Thành phố')}</Label>
                <Controller
                  control={control}
                  name='provinceId'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={(val) => handleProvinceChange(val, field.onChange)}
                    >
                      <SelectTrigger className={errors.provinceId ? 'border-red-500' : ''}>
                        <SelectValue
                          placeholder={t(
                            'address.form.fields.province.placeholder',
                            'Chọn Tỉnh/Thành phố'
                          )}
                        />
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
                <Label>{t('address.form.fields.district.label', 'Quận/Huyện')}</Label>
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
                        <SelectValue
                          placeholder={t(
                            'address.form.fields.district.placeholder',
                            'Chọn Quận/Huyện'
                          )}
                        />
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
                <Label>{t('address.form.fields.ward.label', 'Phường/Xã')}</Label>
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
                        <SelectValue
                          placeholder={t('address.form.fields.ward.placeholder', 'Chọn Phường/Xã')}
                        />
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
                <Label>{t('address.form.fields.specific.label', 'Địa chỉ cụ thể')}</Label>
                <Input
                  placeholder={t(
                    'address.form.fields.specific.placeholder',
                    'Số nhà, Tên tòa nhà, Tên đường...'
                  )}
                  {...register('specificAddress')}
                  className={errors.specificAddress ? 'border-red-500' : ''}
                />
                {errors.specificAddress && (
                  <p className='text-xs text-red-500'>{errors.specificAddress.message}</p>
                )}
              </div>

              {/* Loại địa chỉ */}
              <div className='space-y-2'>
                <Label>{t('address.form.fields.type.label', 'Loại địa chỉ')}</Label>
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
                        {t('address.form.fields.type.home', 'Nhà riêng')}
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
                        {t('address.form.fields.type.office', 'Văn phòng')}
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
                  {t('address.form.fields.isDefault', 'Đặt làm địa chỉ mặc định')}
                </Label>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className='p-6 border-t bg-slate-50 flex gap-3'>
          <Button type='button' variant='outline' className='flex-1' onClick={onClose}>
            {t('address.form.buttons.cancel', 'Hủy')}
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
                {t('address.form.buttons.saving', 'Đang lưu...')}
              </>
            ) : isEditMode ? (
              t('address.form.buttons.update', 'Cập nhật')
            ) : (
              t('address.form.buttons.save', 'Lưu địa chỉ')
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
