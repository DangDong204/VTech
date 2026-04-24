import { KeyRound, EyeOff, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function ChangePasswordPage() {
  const [showPass, setShowPass] = useState(false)

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden'>
        <div className='px-6 py-5 border-b border-slate-100 flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0'>
            <KeyRound className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-slate-800'>Đổi mật khẩu</h2>
            <p className='text-sm text-muted-foreground'>
              Bảo mật tài khoản của bạn bằng mật khẩu mạnh
            </p>
          </div>
        </div>

        <div className='p-6 max-w-xl'>
          <form className='space-y-5'>
            <div className='space-y-2 relative'>
              <Label>Mật khẩu hiện tại</Label>
              <Input type={showPass ? 'text' : 'password'} placeholder='Nhập mật khẩu hiện tại' />
            </div>

            <div className='space-y-2 relative'>
              <Label>Mật khẩu mới</Label>
              <div className='relative'>
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder='Tối thiểu 8 ký tự'
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
            </div>

            <div className='space-y-2 relative'>
              <Label>Xác nhận mật khẩu mới</Label>
              <Input type={showPass ? 'text' : 'password'} placeholder='Nhập lại mật khẩu mới' />
            </div>

            <div className='pt-4'>
              <Button type='button' className='w-full sm:w-auto px-8'>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
