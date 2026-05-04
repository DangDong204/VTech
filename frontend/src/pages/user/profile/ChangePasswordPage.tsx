import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'

import i18n from '@/i18n/i18n'
import { changePasswordApi } from '@/services/user/user.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_REGEX,
  PASSWORD_UPPERCASE_REGEX
} from '@/defines/auth-constants'

// TÍCH HỢP i18n VÀO ZOD SCHEMA (Gọi trực tiếp instance i18n)
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, i18n.t('profile:changePassword.validation.oldPasswordRequired')),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        i18n.t('profile:changePassword.validation.newPasswordMin', { min: PASSWORD_MIN_LENGTH })
      )
      .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
        message: i18n.t('profile:changePassword.validation.newPasswordUppercase')
      })
      .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
        message: i18n.t('profile:changePassword.validation.newPasswordLowercase')
      })
      .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
        message: i18n.t('profile:changePassword.validation.newPasswordNumber')
      })
      .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
        message: i18n.t('profile:changePassword.validation.newPasswordSpecial')
      }),
    confirmPassword: z
      .string()
      .min(1, i18n.t('profile:changePassword.validation.confirmPasswordRequired'))
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18n.t('profile:changePassword.validation.passwordNotMatch'),
    path: ['confirmPassword']
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const { t } = useTranslation('profile')
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => {
      toast.success(res.message || t('changePassword.messages.success'))
      reset()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('changePassword.messages.error'))
      } else {
        toast.error(t('changePassword.messages.systemError'))
      }
    }
  })

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword(values)
  }

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden'>
        <div className='px-6 py-5 border-b border-slate-100 flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0'>
            <KeyRound className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-slate-800'>{t('changePassword.title')}</h2>
            <p className='text-sm text-muted-foreground'>{t('changePassword.subtitle')}</p>
          </div>
        </div>

        <div className='p-6 max-w-xl'>
          <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
            {/* Input: Mật khẩu hiện tại */}
            <div className='space-y-2 relative'>
              <Label htmlFor='oldPassword'>{t('changePassword.fields.oldPassword.label')}</Label>
              <div className='relative'>
                <Input
                  id='oldPassword'
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('changePassword.fields.oldPassword.placeholder')}
                  className={`pr-10 ${errors.oldPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  {...register('oldPassword')}
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className='text-sm text-red-500 font-medium mt-1'>
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* Input: Mật khẩu mới */}
            <div className='space-y-2 relative'>
              <Label htmlFor='newPassword'>{t('changePassword.fields.newPassword.label')}</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('changePassword.fields.newPassword.placeholder', {
                    min: PASSWORD_MIN_LENGTH
                  })}
                  className={`pr-10 ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  {...register('newPassword')}
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.newPassword && (
                <p className='text-sm text-red-500 font-medium mt-1'>
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Input: Xác nhận mật khẩu */}
            <div className='space-y-2 relative'>
              <Label htmlFor='confirmPassword'>
                {t('changePassword.fields.confirmPassword.label')}
              </Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('changePassword.fields.confirmPassword.placeholder')}
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  {...register('confirmPassword')}
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-sm text-red-500 font-medium mt-1'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Nút Submit */}
            <div className='pt-4'>
              <Button type='submit' className='w-full sm:w-auto px-8' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('changePassword.buttons.saving')}
                  </>
                ) : (
                  t('changePassword.buttons.save')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
