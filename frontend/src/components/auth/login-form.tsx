import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { logInSchema } from '@/components/auth/schemas/schemas'
import { useTranslation } from 'react-i18next'

import LanguageSelector from '@/components/common/LanguageSelector'
import type { ApiErrorResponse } from '@/defines/error.type'
import { loginApi } from '@/services/auth/auth.api'
import { parseJwt, useAuthStore } from '@/store/auth.store'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import type z from 'zod'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type LogInFormValue = z.infer<typeof logInSchema>
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LogInFormValue>({
    resolver: zodResolver(logInSchema)
  })

  const login = useAuthStore((state) => state.login)

  const onSubmit = async (data: LogInFormValue) => {
    try {
      const res = await loginApi(data)
      if (res.data?.accessToken) {
        const token = res.data.accessToken

        // 1. Lưu token vào Zustand (và localStorage)
        login(token)
        toast.success(res.message)

        // 2. Giải mã Token ngay lập tức để lấy Roles
        const payload = parseJwt(token)
        const roles = payload?.roles || []

        // 3. Phân luồng điều hướng dựa trên Role
        if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF')) {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>

      const message = axiosError.response?.data?.message || t('login.errors')

      toast.error(message)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <LanguageSelector />
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-2'>
                <a href='/' className='mx-auto block w-fit text-center'>
                  <img src='/logo.svg' alt='Logo' />
                </a>
                <h1 className='text-2xl font-bold'>{t('login.title')}</h1>
                <p className='text-muted-foreground text-balance'>{t('login.subtitle')}</p>
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='email' className='block text-sm'>
                  {t('login.email')}
                </Label>
                <Input
                  type='text'
                  id='email'
                  placeholder='vtech@gmail.com'
                  {...register('email')}
                />
                {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='password' className='block text-sm'>
                  {t('login.password')}
                </Label>
                <Input type='password' id='password' {...register('password')} />
                {errors.password && (
                  <p className='text-destructive text-sm'>{errors.password.message}</p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {t('login.button')}
              </Button>
              <div className='text-center text-sm'>
                {t('login.noAccount')}{' '}
                <a href='/signup' className='underline underline-offset-4'>
                  {t('login.signup')}
                </a>
              </div>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block'>
            <img
              src='/placeholder.png'
              alt='Image'
              className='absolute top-1/2 -translate-y-1/2 object-cover'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
