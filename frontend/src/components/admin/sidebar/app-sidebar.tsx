import {
  AudioWaveform,
  BadgeDollarSign,
  Box,
  CircleStar,
  Command,
  GalleryVerticalEnd,
  ListCollapseIcon,
  MessageCircleMore,
  Settings,
  ShoppingCart,
  StickyNote,
  Tags,
  TicketPercent,
  Users2
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/admin/sidebar/nav-main'
import { NavProjects } from '@/components/admin/sidebar/nav-projects'
import { NavUser } from '@/components/admin/sidebar/nav-user'
import { TeamSwitcher } from '@/components/admin/sidebar/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { getAllOrdersAdminApi } from '@/services/order/order.api'
import { useTranslation } from 'react-i18next'

// Các data tĩnh không cần i18n
const staticData = {
  teams: [
    { name: 'Vtech ', logo: GalleryVerticalEnd, plan: 'Enterprise' },
    { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' },
    { name: 'Evil Corp.', logo: Command, plan: 'Free' }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const { t } = useTranslation('sidebar')

  // --- LẤY QUYỀN CỦA USER HIỆN TẠI ---
  const roles = user?.roles || []
  const isAdmin = roles.includes('ROLE_ADMIN')
  const isStaff = roles.includes('ROLE_STAFF')

  // 1. Fetch toàn bộ đơn hàng ngầm (Polling mỗi 30s 1 lần)
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrdersAdminApi,
    refetchInterval: 30000,
    staleTime: 10000
  })

  // 2. Tính tổng số đơn hàng đang chờ xác nhận (PENDING)
  const pendingOrdersCount = orders?.filter((order) => order.orderStatus === 'PENDING').length || 0

  // 3. TẠO MENU CHÍNH (NavMain) THEO QUYỀN
  const navMain = []

  // Nhóm Sản phẩm: Admin thấy đủ (List, Color, Version, Receipt), Staff chỉ thấy Nhập kho (Receipt)
  const productSubItems = []

  if (isAdmin) {
    productSubItems.push(
      { title: t('products.list'), url: '/dashboard/products' },
      { title: t('products.colors'), url: '/dashboard/colors' },
      { title: t('products.versions'), url: '/dashboard/versions' }
    )
  }

  // Receipt thì cả Admin và Staff đều thấy
  if (isAdmin || isStaff) {
    productSubItems.push({ title: t('products.receipt'), url: '/dashboard/receipts' })
  }

  // Nếu có bất kỳ item con nào thì mới hiện nhóm "Sản phẩm"
  if (productSubItems.length > 0) {
    navMain.push({
      title: t('products.title'),
      url: '#',
      icon: Box,
      isActive: true,
      items: productSubItems
    })
  }

  // Quản lý Đơn hàng: Cả Admin và Staff đều thấy
  if (isAdmin || isStaff) {
    navMain.push({
      title: t('orders.title'),
      url: '/dashboard/orders',
      icon: ShoppingCart,
      isActive: true,
      badge: pendingOrdersCount
    })
  }

  // 4. TẠO MENU PHỤ (NavProjects) THEO QUYỀN
  // Định nghĩa toàn bộ cấu trúc Menu
  const allProjects = [
    {
      name: t('projects.categories'),
      url: '/dashboard/categories',
      icon: ListCollapseIcon,
      requireAdmin: true
    },
    { name: t('projects.brands'), url: '/dashboard/brands', icon: CircleStar, requireAdmin: true },
    { name: t('projects.blog'), url: '/dashboard/articles', icon: StickyNote, requireAdmin: false }, // Staff đc vào
    { name: t('projects.users'), url: '/dashboard/users', icon: Users2, requireAdmin: true },
    {
      name: t('projects.vouchers'),
      url: '/dashboard/vouchers',
      icon: TicketPercent,
      requireAdmin: true
    },
    {
      name: t('projects.promotions'),
      url: '/dashboard/promotions',
      icon: BadgeDollarSign,
      requireAdmin: true
    },
    { name: t('projects.tags'), url: '/dashboard/tags', icon: Tags, requireAdmin: true },
    {
      name: t('projects.reviews'),
      url: '/dashboard/reviews',
      icon: MessageCircleMore,
      requireAdmin: false
    }, // Staff đc vào
    { name: t('projects.settings'), url: '#', icon: Settings, requireAdmin: true }
  ]

  // Lọc ra các menu phù hợp
  const projects = allProjects.filter((project) => {
    if (isAdmin) return true // Admin thấy tất cả
    if (isStaff && !project.requireAdmin) return true // Staff chỉ thấy những mục KHÔNG yêu cầu quyền Admin
    return false
  })

  const userData = {
    name: user?.username || user?.sub?.split('@')[0] || 'VTech Admin',
    email: user?.sub || 'vtech@gmail.com',
    avatar: user?.avatar || 'https://ui.shadcn.com/avatars/02.png'
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>

      <SidebarContent className='overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300'>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
