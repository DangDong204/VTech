import LanguageSelector from '@/components/common/LanguageSelector'
import { ModeToggle } from '@/components/provider/MoodToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getAllOrdersAdminApi } from '@/services/order/order.api'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BreadcrumbHeader() {
  const location = useLocation()
  const path = location.pathname.split('/').filter(Boolean)

  // Tận dụng cache của React Query để lấy data không tốn API
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrdersAdminApi,
    staleTime: 10000
  })
  const pendingCount = orders?.filter((order) => order.orderStatus === 'PENDING').length || 0

  const getPageTitle = () => {
    if (path.includes('users')) return 'Users'
    // if (path.includes('dashboard')) return 'Dashboard'
    return 'Dashboard'
  }

  return (
    <header className='flex w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink href='/dashboard'>VTech</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='hidden md:block' />
            {path.length > 2 && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${path[0]}`}>
                    {path[0].charAt(0).toUpperCase() + path[0].slice(1)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ĐÃ THÊM WRAPPER NÀY: Dùng ml-auto để đẩy toàn bộ sang góc phải */}
      <div className='flex items-center gap-2 ml-auto pr-4'>
        <Link
          to='/dashboard/orders'
          className='relative p-2 rounded-full hover:bg-slate-100 transition-colors'
        >
          <Bell className='w-5 h-5 text-slate-600' />
          {pendingCount > 0 && (
            <span className='absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white'>
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </Link>
        <ModeToggle />
        <LanguageSelector />
      </div>
    </header>
  )
}
