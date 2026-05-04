import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { verifyOtpApi, resendOtpApi } from '@/services/user/user.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'

interface OtpModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onSuccess: () => void
}

export function OtpModal({ isOpen, onClose, email, onSuccess }: OtpModalProps) {
  const { t } = useTranslation('auth')
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(60)

  // Reset state mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setCountdown(60)
      setOtpCode('')
    }
  }, [isOpen])

  // Đếm ngược
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown, isOpen])

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('signup.otpModal.verifyError'))
    }
  })

  const resendOtpMutation = useMutation({
    mutationFn: resendOtpApi,
    onSuccess: () => {
      toast.success(t('signup.otpModal.resendSuccess'))
      setCountdown(60)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || t('signup.otpModal.resendError'))
    }
  })

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) {
      toast.error(t('signup.otpModal.emptyOtp'))
      return
    }
    verifyOtpMutation.mutate({ email, otpCode })
  }

  const handleResendOtp = () => {
    if (countdown > 0) return
    resendOtpMutation.mutate({ email })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          toast.warning(t('signup.otpModal.warningClose'), {
            id: 'otp-warning-msg'
          })
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl'>{t('signup.otpModal.title')}</DialogTitle>
          <DialogDescription className='text-center pt-2'>
            {t('signup.otpModal.subtitle')} <br />
            <span className='font-bold text-slate-800'>{email}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerifyOtp} className='flex flex-col gap-6 py-4'>
          <div className='flex flex-col items-center justify-center gap-4'>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => setOtpCode(value)}
              disabled={verifyOtpMutation.isPending}
            >
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
            className='w-full h-12 text-base mt-2'
            disabled={otpCode.length < 6 || verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : null}
            {t('signup.otpModal.verifyBtn')}
          </Button>
          <div className='text-center text-sm text-muted-foreground'>
            {t('signup.otpModal.notReceived')}{' '}
            <button
              type='button'
              onClick={handleResendOtp}
              disabled={countdown > 0 || resendOtpMutation.isPending}
              className={cn(
                'font-medium underline underline-offset-4 transition-colors',
                countdown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-primary hover:text-primary/80'
              )}
            >
              {resendOtpMutation.isPending
                ? t('signup.otpModal.sending')
                : countdown > 0
                  ? t('signup.otpModal.resendWait', { seconds: countdown })
                  : t('signup.otpModal.resend')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
