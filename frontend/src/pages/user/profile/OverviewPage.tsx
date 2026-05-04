import type { ApiErrorResponse } from '@/defines/error.type'
import { getMyOrdersApi } from '@/services/order/order.api'
import { getMyProfileApi, updateMyProfileApi } from '@/services/user/user.api'
import { getMyVouchersApi } from '@/services/voucher/voucher.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import {
  Calendar as CalendarIconLucide,
  Camera,
  ChevronRight,
  Coins,
  Loader2,
  Mail,
  Package,
  Phone,
  Ticket,
  User,
  UserCircle,
  UserRound,
  Users,
  X
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

// Form & Validate
import { updateProfileSchema } from '@/components/auth/schemas/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import type z from 'zod'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const { t } = useTranslation('profile')
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States cho Form, Avatar và Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfileApi
  })

  const { data: orders = [] } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrdersApi })
  const { data: vouchers = [] } = useQuery({ queryKey: ['my-vouchers'], queryFn: getMyVouchersApi })

  // Khởi tạo Form
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phone: '',
      gender: ''
    }
  })

  const { watch } = form
  const currentGender = watch('gender')

  // Mở Sheet & Nạp dữ liệu
  const handleOpenSheet = () => {
    if (user) {
      form.reset({
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        gender: user.gender?.toUpperCase() || ''
      })
      setAvatarPreview(user.avatar || null)
      setAvatarFile(null)
    }
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
  }

  // API Cập nhật
  const updateMutation = useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: () => {
      toast.success(t('overview.sheet.messages.success'))
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      handleCloseSheet()
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('overview.sheet.messages.error'))
    }
  })

  const onSubmit = (data: z.infer<typeof updateProfileSchema>) => {
    updateMutation.mutate({ ...data, avatar: avatarFile })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const ordersProcessing = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.orderStatus)
  ).length

  if (isLoadingUser) {
    return (
      <div className='flex items-center justify-center p-16'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin' />
          <p className='text-sm text-slate-500 font-medium'>{t('overview.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const formatDob = (dobString?: string | null) => {
    if (!dobString) return t('overview.accountInfo.fields.dobEmpty')
    try {
      return new Intl.DateTimeFormat('vi-VN').format(new Date(dobString))
    } catch {
      return dobString
    }
  }

  const stats = [
    {
      to: '/orders',
      icon: <Package className='h-6 w-6' />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accentColor: 'from-blue-400 to-blue-600',
      label: t('overview.stats.ordersProcessing'),
      value: ordersProcessing,
      suffix: t('overview.stats.ordersSuffix')
    },
    {
      to: '/offers',
      icon: <Ticket className='h-6 w-6' />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accentColor: 'from-emerald-400 to-emerald-600',
      label: t('overview.stats.vouchers'),
      value: vouchers.length,
      suffix: t('overview.stats.vouchersSuffix')
    },
    {
      to: '/rewards',
      icon: <Coins className='h-6 w-6' />,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      accentColor: 'from-orange-400 to-red-500',
      label: t('overview.stats.points'),
      value: new Intl.NumberFormat('vi-VN').format(user.currentVpoint || 0),
      suffix: t('overview.stats.pointsSuffix')
    }
  ]

  const infoFields = [
    {
      icon: <UserCircle className='h-5 w-5' />,
      label: t('overview.accountInfo.fields.fullName'),
      value: user.fullName || user.username,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50'
    },
    {
      icon: <Phone className='h-5 w-5' />,
      label: t('overview.accountInfo.fields.phone'),
      value: user.phone || t('overview.accountInfo.fields.phoneEmpty'),
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      empty: !user.phone
    },
    {
      icon: <Mail className='h-5 w-5' />,
      label: t('overview.accountInfo.fields.email'),
      value: user.email,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50'
    },
    {
      icon: <CalendarIconLucide className='h-5 w-5' />,
      label: t('overview.accountInfo.fields.dob'),
      value: formatDob(user.dob),
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      empty: !user.dob
    }
  ]

  return (
    <div className='flex flex-col gap-5'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.to}
            className='group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 p-5'
          >
            <div
              className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${stat.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div className='flex items-start justify-between mb-4'>
              <div
                className={`h-11 w-11 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.icon}
              </div>
              <ChevronRight className='h-4 w-4 text-slate-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all' />
            </div>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'>
              {stat.label}
            </p>
            <p className='text-2xl font-black text-slate-800 leading-none'>
              {stat.value}
              <span className='text-sm font-medium text-slate-400 ml-1'>{stat.suffix}</span>
            </p>
          </Link>
        ))}
      </div>

      {/* Account Info Card */}
      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='px-6 py-4 flex items-center justify-between border-b border-slate-50'>
          <div className='flex items-center gap-2'>
            <div className='h-1 w-4 rounded-full bg-red-500' />
            <h2 className='text-base font-bold text-slate-800'>
              {t('overview.accountInfo.title')}
            </h2>
          </div>

          <button
            onClick={handleOpenSheet}
            className='inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors'
          >
            {t('overview.accountInfo.editButton')}
            <ChevronRight className='h-3 w-3' />
          </button>
        </div>

        {/* Info Grid */}
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {infoFields.map((field, i) => (
            <div
              key={i}
              className='flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group'
            >
              <div
                className={`h-9 w-9 rounded-lg ${field.iconBg} ${field.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                {field.icon}
              </div>
              <div className='min-w-0'>
                <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5'>
                  {field.label}
                </p>
                <p
                  className={`text-sm font-semibold leading-snug ${field.empty ? 'text-slate-400 italic' : 'text-slate-800'}`}
                >
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CUSTOM SHEET ================= */}

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleCloseSheet}
      />

      {/* Sliding Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
          isSheetOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2 font-bold text-lg text-slate-800'>
            <UserCircle className='h-5 w-5 text-red-600' />
            {t('overview.sheet.title')}
          </div>
          <button
            onClick={handleCloseSheet}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 overflow-y-auto p-6 scrollbar-thin'>
          <form id='profile-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Avatar Upload */}
            <div className='flex flex-col items-center gap-3'>
              <div
                className='relative group cursor-pointer'
                onClick={() => fileInputRef.current?.click()}
              >
                <div className='h-24 w-24 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-red-500 transition-colors'>
                  <img
                    src={avatarPreview || '/placeholder-avatar.png'}
                    alt='Avatar'
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Camera className='h-6 w-6 text-white' />
                </div>
              </div>
              <input
                type='file'
                ref={fileInputRef}
                className='hidden'
                accept='image/*'
                onChange={handleAvatarChange}
              />
              <p className='text-xs text-muted-foreground'>{t('overview.sheet.avatarHint')}</p>
            </div>

            {/* Email (Disabled) */}
            <div className='space-y-2'>
              <Label>{t('overview.sheet.fields.email')}</Label>
              <Input value={user.email} disabled className='bg-slate-50' />
            </div>

            {/* Username & Full Name Row */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('overview.sheet.fields.username')}</Label>
                <Input
                  {...form.register('username')}
                  className={form.formState.errors.username ? 'border-red-500' : ''}
                />
                {form.formState.errors.username && (
                  <p className='text-xs text-red-500'>{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>{t('overview.sheet.fields.fullName')}</Label>
                <Input
                  {...form.register('fullName')}
                  className={form.formState.errors.fullName ? 'border-red-500' : ''}
                />
                {form.formState.errors.fullName && (
                  <p className='text-xs text-red-500'>{form.formState.errors.fullName.message}</p>
                )}
              </div>
            </div>

            {/* Phone & Date of Birth Row */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Phone */}
              <div className='space-y-2'>
                <Label>{t('overview.sheet.fields.phone')}</Label>
                <Input
                  {...form.register('phone')}
                  className={form.formState.errors.phone ? 'border-red-500' : ''}
                />
                {form.formState.errors.phone && (
                  <p className='text-xs text-red-500'>{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>{t('overview.sheet.fields.dob')}</Label>
                <Input
                  value={user.dob ? formatDob(user.dob) : t('overview.accountInfo.fields.dobEmpty')}
                  disabled
                  className='bg-slate-50'
                />
              </div>
            </div>

            {/* Gender Selection (Block Buttons) */}
            <div className='space-y-2'>
              <Label>{t('overview.sheet.fields.gender.label')}</Label>
              <Controller
                control={form.control}
                name='gender'
                render={({ field: { onChange } }) => (
                  <div className='grid grid-cols-3 gap-3'>
                    <button
                      type='button'
                      onClick={() => onChange('MALE')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-medium',
                        currentGender === 'MALE'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <User
                        className={cn(
                          'h-5 w-5',
                          currentGender === 'MALE' ? 'text-red-500' : 'text-slate-400'
                        )}
                      />
                      {t('overview.sheet.fields.gender.male')}
                    </button>
                    <button
                      type='button'
                      onClick={() => onChange('FEMALE')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-medium',
                        currentGender === 'FEMALE'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <UserRound
                        className={cn(
                          'h-5 w-5',
                          currentGender === 'FEMALE' ? 'text-red-500' : 'text-slate-400'
                        )}
                      />
                      {t('overview.sheet.fields.gender.female')}
                    </button>
                    <button
                      type='button'
                      onClick={() => onChange('OTHER')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-medium',
                        currentGender === 'OTHER'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Users
                        className={cn(
                          'h-5 w-5',
                          currentGender === 'OTHER' ? 'text-red-500' : 'text-slate-400'
                        )}
                      />
                      {t('overview.sheet.fields.gender.other')}
                    </button>
                  </div>
                )}
              />
              {form.formState.errors.gender && (
                <p className='text-xs text-red-500'>{form.formState.errors.gender.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className='p-6 border-t bg-slate-50 flex gap-3'>
          <Button type='button' variant='outline' className='flex-1' onClick={handleCloseSheet}>
            {t('overview.sheet.buttons.cancel')}
          </Button>
          <Button
            type='submit'
            form='profile-form'
            className='flex-1 bg-red-600 hover:bg-red-700 text-white'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('overview.sheet.buttons.saving')}
              </>
            ) : (
              t('overview.sheet.buttons.save')
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
