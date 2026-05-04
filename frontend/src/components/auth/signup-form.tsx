import { signUpSchema } from '@/components/auth/schemas/schemas'
import LanguageSelector from '@/components/common/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApiErrorResponse } from '@/defines/error.type'
import { useSignUp } from '@/hooks/useSignup'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AxiosError } from 'axios'
import { Calendar as CalendarIconLucide, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import type z from 'zod'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { format } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { OtpModal } from '@/components/auth/OtpModal'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t, i18n } = useTranslation('auth')
  const navigate = useNavigate()

  const [showOtpModal, setShowOtpModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [showPass, setShowPass] = useState(false)

  const dateLocale = i18n.language === 'vi' ? vi : enUS

  type SignUpFormValue = z.infer<typeof signUpSchema>

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValue>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      dob: '',
      gender: ''
    }
  })

  const signUpMutation = useSignUp()

  const onSubmit = async (data: SignUpFormValue) => {
    try {
      await signUpMutation.mutateAsync(data)
      setRegisteredEmail(data.email)
      setShowOtpModal(true)
      toast.success(t('signup.success'))
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      const message = axiosError.response?.data?.message || t('signup.errors')
      toast.error(message)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <LanguageSelector />
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-5'>
          <form
            className='p-6 md:p-8 col-span-3 flex flex-col gap-5'
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className='flex flex-col items-center gap-2 mb-2'>
              <a href='/' className='mx-auto block w-fit text-center'>
                <img src='/logo.svg' alt='Logo' />
              </a>
              <h1 className='text-2xl font-bold'>{t('signup.title')}</h1>
              <p className='text-muted-foreground text-balance'>{t('signup.subtitle')}</p>
            </div>

            {/* HÀNG 1: HỌ TÊN & USERNAME */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='fullName'>{t('signup.fullName')}</Label>
                <Input
                  type='text'
                  id='fullName'
                  placeholder='Nguyễn Văn A'
                  {...register('fullName')}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className='text-destructive text-xs'>{errors.fullName.message}</p>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='username'>{t('signup.username')}</Label>
                <Input
                  type='text'
                  id='username'
                  placeholder='VTechUser'
                  {...register('username')}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className='text-destructive text-xs'>{errors.username.message}</p>
                )}
              </div>
            </div>

            {/* HÀNG 2: NGÀY SINH & GIỚI TÍNH */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label>{t('signup.dob')}</Label>
                <Controller
                  control={control}
                  name='dob'
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal px-3',
                            !field.value && 'text-muted-foreground',
                            errors.dob && 'border-red-500'
                          )}
                        >
                          <CalendarIconLucide className='mr-2 h-4 w-4 shrink-0' />
                          {field.value ? (
                            format(new Date(field.value), 'dd/MM/yyyy')
                          ) : (
                            <span>{t('signup.dob')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          // 1. Chuyển sang layout dropdown (hoặc dropdown-buttons)
                          captionLayout='dropdown'
                          // 2. Định nghĩa tháng bắt đầu và kết thúc (Thay cho fromYear/toYear)
                          startMonth={new Date(1940, 0)}
                          endMonth={new Date()}
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                          // Vẫn giữ disabled để chặn chọn ngày tương lai
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                          locale={dateLocale}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dob && <p className='text-destructive text-xs'>{errors.dob.message}</p>}
              </div>

              <div className='flex flex-col gap-2'>
                <Label>{t('signup.gender.label')}</Label>
                <Controller
                  control={control}
                  name='gender'
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('signup.gender.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='MALE'>{t('signup.gender.male')}</SelectItem>
                        <SelectItem value='FEMALE'>{t('signup.gender.female')}</SelectItem>
                        <SelectItem value='OTHER'>{t('signup.gender.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className='text-destructive text-xs'>{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* HÀNG 3: EMAIL & ĐIỆN THOẠI */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='email'>{t('signup.email')}</Label>
                <Input
                  type='email'
                  id='email'
                  placeholder='vtech@gmail.com'
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className='text-destructive text-xs'>{errors.email.message}</p>}
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='phone'>{t('signup.phone')}</Label>
                <Input
                  type='text'
                  id='phone'
                  placeholder='0987654321'
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className='text-destructive text-xs'>{errors.phone.message}</p>}
              </div>
            </div>

            {/* HÀNG 4: MẬT KHẨU */}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='password'>{t('signup.password')}</Label>
              <div className='relative'>
                <Input
                  type={showPass ? 'text' : 'password'}
                  id='password'
                  {...register('password')}
                  className={cn('pr-10', errors.password && 'border-red-500')}
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.password && (
                <p className='text-destructive text-xs'>{errors.password.message}</p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full mt-2'
              disabled={isSubmitting || signUpMutation.isPending}
            >
              {isSubmitting || signUpMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              {t('signup.button')}
            </Button>

            <div className='text-center text-sm'>
              {t('signup.hasAccount')}{' '}
              <Link to='/login' className='underline underline-offset-4 hover:text-primary'>
                {t('signup.login')}
              </Link>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block col-span-2'>
            <img
              src='/placeholderSignUp.png'
              alt='Image'
              className='absolute h-full w-full object-cover'
            />
          </div>
        </CardContent>
      </Card>

      <div className='text-sm text-balance px-6 text-center text-muted-foreground'>
        <Trans
          ns='auth'
          i18nKey='signup.term-privacy'
          components={{
            terms: <a href='#' className='underline underline-offset-4 hover:text-primary' />,
            privacy: <a href='#' className='underline underline-offset-4 hover:text-primary' />
          }}
        />
      </div>

      {/* GỌI MODAL TẠI ĐÂY */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={registeredEmail}
        onSuccess={() => {
          setShowOtpModal(false)
          navigate('/login')
        }}
      />
    </div>
  )
}
