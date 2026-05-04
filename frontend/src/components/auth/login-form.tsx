import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

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
import { useLocation, useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import type z from 'zod'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type LogInFormValue = z.infer<typeof logInSchema>
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [showPass, setShowPass] = useState(false)

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

        login(token)
        toast.success(res.message)

        const payload = parseJwt(token)
        const roles = payload?.roles || []

        if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF')) {
          navigate('/dashboard')
        } else {
          navigate(from)
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
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password' className='block text-sm'>
                    {t('login.password')}
                  </Label>
                  <Link
                    to='/forgot-password'
                    className='text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors'
                  >
                    {t('login.forgot')}
                  </Link>
                </div>

                <div className='relative'>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    id='password'
                    className='pr-10'
                    {...register('password')}
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
                  <p className='text-destructive text-sm'>{errors.password.message}</p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {t('login.button')}
              </Button>
              <div className='text-center text-sm'>
                {t('login.noAccount')}{' '}
                <Link to='/signup' className='underline underline-offset-4 hover:text-primary'>
                  {t('login.signup')}
                </Link>
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
