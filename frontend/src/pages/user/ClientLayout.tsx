import { Footer } from '@/components/user/home/Footer'
import { Header } from '@/components/user/home/Header'
import { Outlet } from 'react-router-dom'

export default function ClientLayout() {
  return (
    <div className='flex min-h-screen flex-col bg-slate-50'>
      {/* Header luôn nằm trên cùng */}
      <Header />

      {/* Phần main chứa nội dung các trang con (Trang chủ, Chi tiết SP...) */}
      <main className='flex-1 pb-8 pt-4'>
        <Outlet />
      </main>

      {/* Footer luôn nằm dưới cùng */}
      <Footer />
    </div>
  )
}
