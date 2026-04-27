import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { verifyVnPayReturnApi } from '@/services/order/order.api'
import type { OrderResponse } from '@/services/order/order.type'

export default function VnPayReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const calledRef = useRef(false) // Tránh strict mode gọi API 2 lần

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!searchParams.toString()) {
      navigate('/')
      return
    }

    const verifyPayment = async () => {
      if (calledRef.current) return
      calledRef.current = true

      try {
        const queryString = `?${searchParams.toString()}`
        // Đọc mã phản hồi trực tiếp từ URL của VNPAY
        const responseCode = searchParams.get('vnp_ResponseCode')

        const data = await verifyVnPayReturnApi(queryString)
        setOrder(data)

        // KIỂM TRA MÃ PHẢN HỒI
        if (responseCode === '00') {
          setStatus('success')
        } else {
          setStatus('error')
          // Cập nhật câu thông báo mới để điều hướng người dùng
          setErrorMessage(
            'Bạn đã hủy thanh toán hoặc giao dịch thất bại. Vui lòng vào mục Quản lý đơn hàng để tiếp tục thanh toán (Đơn hàng sẽ tự động hủy sau 15 phút).'
          )
        }
      } catch {
        setStatus('error')
        setErrorMessage('Giao dịch không hợp lệ.')
      }
    }

    verifyPayment()
  }, [searchParams, navigate])

  const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

  return (
    <div className='min-h-[70vh] flex items-center justify-center bg-slate-50 p-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500'>
        {/* TRẠNG THÁI LOADING */}
        {status === 'loading' && (
          <div className='p-12 flex flex-col items-center justify-center text-center space-y-4'>
            <Loader2 className='w-16 h-16 text-blue-600 animate-spin' />
            <h2 className='text-xl font-bold text-slate-800'>Đang xử lý giao dịch...</h2>
            <p className='text-slate-500'>Vui lòng không đóng trình duyệt lúc này.</p>
          </div>
        )}

        {/* TRẠNG THÁI THÀNH CÔNG */}
        {status === 'success' && order && (
          <div className='p-8 flex flex-col items-center text-center'>
            <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6'>
              <CheckCircle2 className='w-12 h-12 text-emerald-600' />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 mb-2'>Thanh toán thành công!</h2>
            <p className='text-slate-500 mb-6'>
              Cảm ơn bạn đã mua sắm tại VTech. Đơn hàng của bạn đang được xử lý.
            </p>

            <div className='w-full bg-slate-50 rounded-xl p-4 space-y-3 mb-8 text-sm border border-slate-100'>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Mã đơn hàng</span>
                <span className='font-bold text-slate-800'>{order.orderCode}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Phương thức</span>
                <span className='font-bold text-slate-800'>VNPAY</span>
              </div>
              <div className='flex justify-between pt-3 border-t border-slate-200'>
                <span className='text-slate-500'>Tổng thanh toán</span>
                <span className='font-bold text-red-600 text-lg'>
                  {formatVnd(order.finalPrice)}
                </span>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full'>
              <Button variant='outline' className='flex-1' asChild>
                <Link to='/profile/orders'>
                  <ShoppingBag className='w-4 h-4 mr-2' /> Quản lý đơn hàng
                </Link>
              </Button>
              <Button className='flex-1 bg-emerald-600 hover:bg-emerald-700' asChild>
                <Link to='/'>Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI THẤT BẠI */}
        {status === 'error' && (
          <div className='p-8 flex flex-col items-center text-center'>
            <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6'>
              <XCircle className='w-12 h-12 text-red-600' />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 mb-2'>Thanh toán thất bại</h2>
            <p className='text-slate-500 mb-6'>{errorMessage}</p>

            <div className='flex flex-col sm:flex-row gap-3 w-full'>
              <Button variant='outline' className='flex-1' onClick={() => navigate(-1)}>
                <ArrowLeft className='w-4 h-4 mr-2' /> Quay lại
              </Button>
              <Button className='flex-1' asChild>
                <Link to='/orders'>Kiểm tra đơn hàng</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
