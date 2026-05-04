import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2, ArrowLeft, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next' // THÊM IMPORT NÀY

import {
  forgotPasswordApi,
  resetPasswordApi,
  resendOtpApi,
  verifyOtpApi
} from '@/services/user/user.api'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordStep1Schema,
  forgotPasswordStep3Schema
} from '@/components/auth/schemas/schemas'
import type z from 'zod'
import { cn } from '@/lib/utils'
import LanguageSelector from '@/components/common/LanguageSelector'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth') // SỬ DỤNG HOOK
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (step >= 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown, step])

  const formStep1 = useForm<z.infer<typeof forgotPasswordStep1Schema>>({
    resolver: zodResolver(forgotPasswordStep1Schema),
    defaultValues: { email: '' }
  })

  const formStep3 = useForm<z.infer<typeof forgotPasswordStep3Schema>>({
    resolver: zodResolver(forgotPasswordStep3Schema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (_, variables) => {
      setEmail(variables.email)
      toast.success(t('forgotPassword.toast.otpSent'))
      setStep(2)
      setCountdown(60)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('forgotPassword.toast.errorDefault'))
    }
  })

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: () => {
      toast.success(t('forgotPassword.toast.otpVerified'))
      setStep(3)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('forgotPassword.toast.otpInvalid'))
      setOtpCode('')
    }
  })

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success(t('forgotPassword.toast.passwordReset'))
      navigate('/login')
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('forgotPassword.toast.resetInvalid'))
      if (axiosError.response?.data?.code === 2010 || axiosError.response?.data?.code === 2011) {
        setStep(2)
        setOtpCode('')
      }
    }
  })

  const resendOtpMutation = useMutation({
    mutationFn: resendOtpApi,
    onSuccess: () => {
      toast.success(t('forgotPassword.toast.resendSuccess'))
      setCountdown(60)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('forgotPassword.toast.resendFailed'))
    }
  })

  const onSubmitStep1 = (data: z.infer<typeof forgotPasswordStep1Schema>) => {
    forgotPasswordMutation.mutate(data)
  }

  const onSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) return
    verifyOtpMutation.mutate({ email, otpCode })
  }

  const onSubmitStep3 = (data: z.infer<typeof forgotPasswordStep3Schema>) => {
    resetPasswordMutation.mutate({
      email: email,
      otpCode: otpCode,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <LanguageSelector />
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          {/* CỘT TRÁI: FORM */}
          <div className='p-6 md:p-8 flex flex-col gap-6'>
            {/* HEADER */}
            <div className='flex flex-col items-center gap-2'>
              <a href='/' className='mx-auto block w-fit text-center'>
                <img src='/logo.svg' alt='Logo' />
              </a>
              <h1 className='text-2xl font-bold'>
                {step === 1 && t('forgotPassword.step1.title')}
                {step === 2 && t('forgotPassword.step2.title')}
                {step === 3 && t('forgotPassword.step3.title')}
              </h1>
              <p className='text-muted-foreground text-center text-balance'>
                {step === 1 && t('forgotPassword.step1.subtitle')}
                {step === 2 && t('forgotPassword.step2.subtitle', { email: email })}
                {step === 3 && t('forgotPassword.step3.subtitle')}
              </p>
            </div>

            {/* DYNAMIC FORMS */}
            <div className='mt-2'>
              {step === 1 && (
                <form
                  onSubmit={formStep1.handleSubmit(onSubmitStep1)}
                  className='flex flex-col gap-4'
                >
                  <div className='flex flex-col gap-3'>
                    <Label htmlFor='email' className='text-sm'>
                      {t('forgotPassword.step1.emailLabel')}
                    </Label>
                    <Input
                      id='email'
                      placeholder='vtech@gmail.com'
                      {...formStep1.register('email')}
                    />
                    {formStep1.formState.errors.email && (
                      <p className='text-destructive text-sm'>
                        {formStep1.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type='submit'
                    className='w-full mt-2'
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('forgotPassword.step1.button')}
                  </Button>
                  <div className='text-center text-sm mt-4'>
                    <button
                      type='button'
                      onClick={() => navigate('/login')}
                      className='text-primary hover:underline flex items-center justify-center gap-2 w-full'
                    >
                      <ArrowLeft className='h-4 w-4' /> {t('forgotPassword.step1.backToLogin')}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={onSubmitStep2} className='flex flex-col gap-5'>
                  <div className='flex flex-col items-center gap-4'>
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup className='gap-2'>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              'h-10 w-10 sm:h-12 sm:w-12 text-lg font-semibold border border-slate-300 rounded-md',
                              index > 0 && 'border-l'
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type='submit'
                    className='w-full mt-2'
                    disabled={otpCode.length < 6 || verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('forgotPassword.step2.button')}
                  </Button>

                  <div className='text-center text-sm text-muted-foreground mt-2'>
                    {t('forgotPassword.step2.notReceived')}{' '}
                    <button
                      type='button'
                      onClick={() => resendOtpMutation.mutate({ email })}
                      disabled={countdown > 0 || resendOtpMutation.isPending}
                      className={
                        countdown > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-primary hover:underline'
                      }
                    >
                      {resendOtpMutation.isPending
                        ? t('forgotPassword.step2.sending')
                        : countdown > 0
                          ? t('forgotPassword.step2.resendWait', { seconds: countdown })
                          : t('forgotPassword.step2.resend')}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form
                  onSubmit={formStep3.handleSubmit(onSubmitStep3)}
                  className='flex flex-col gap-4'
                >
                  {/* MẬT KHẨU MỚI */}
                  <div className='flex flex-col gap-3'>
                    <Label htmlFor='newPassword'>
                      {t('forgotPassword.step3.newPasswordLabel')}
                    </Label>
                    <div className='relative'>
                      <Input
                        id='newPassword'
                        type={showNewPassword ? 'text' : 'password'}
                        className='pr-10'
                        {...formStep3.register('newPassword')}
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                      >
                        {showNewPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {formStep3.formState.errors.newPassword && (
                      <p className='text-destructive text-sm'>
                        {formStep3.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* XÁC NHẬN MẬT KHẨU */}
                  <div className='flex flex-col gap-3'>
                    <Label htmlFor='confirmPassword'>
                      {t('forgotPassword.step3.confirmPasswordLabel')}
                    </Label>
                    <div className='relative'>
                      <Input
                        id='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        className='pr-10'
                        {...formStep3.register('confirmPassword')}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {formStep3.formState.errors.confirmPassword && (
                      <p className='text-destructive text-sm'>
                        {formStep3.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    className='w-full mt-4'
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('forgotPassword.step3.button')}
                  </Button>

                  <div className='text-center text-sm mt-2'>
                    <button
                      type='button'
                      onClick={() => setStep(1)}
                      className='text-muted-foreground hover:text-primary hover:underline'
                    >
                      {t('forgotPassword.step3.changeEmail')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: ẢNH PLACEHOLDER */}
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
