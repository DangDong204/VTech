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
import { useTranslation } from 'react-i18next' // <-- IMPORT THÊM HOOK I18N

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
  const { t } = useTranslation('sidebar') // <-- KHỞI TẠO TRANSLATION

  // 1. Fetch toàn bộ đơn hàng ngầm (Polling mỗi 30s 1 lần)
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrdersAdminApi,
    refetchInterval: 30000,
    staleTime: 10000
  })

  // 2. Tính tổng số đơn hàng đang chờ xác nhận (PENDING)
  const pendingOrdersCount = orders?.filter((order) => order.orderStatus === 'PENDING').length || 0

  // 3. Mảng Menu Chính (Sử dụng t() để dịch)
  const navMain = [
    {
      title: t('products.title'),
      url: '#',
      icon: Box,
      isActive: true,
      items: [
        { title: t('products.list'), url: '/dashboard/products' },
        { title: t('products.colors'), url: '/dashboard/colors' },
        { title: t('products.versions'), url: '/dashboard/versions' },
        { title: t('products.receipt'), url: '/dashboard/receipts' }
      ]
    },
    {
      title: t('orders.title'),
      url: '/dashboard/orders',
      icon: ShoppingCart,
      isActive: true,
      badge: pendingOrdersCount
    }
  ]

  // 4. Mảng Projects (Sử dụng t() để dịch)
  const projects = [
    { name: t('projects.categories'), url: '/dashboard/categories', icon: ListCollapseIcon },
    { name: t('projects.brands'), url: '/dashboard/brands', icon: CircleStar },
    { name: t('projects.blog'), url: '/dashboard/articles', icon: StickyNote },
    { name: t('projects.users'), url: '/dashboard/users', icon: Users2 },
    { name: t('projects.vouchers'), url: '/dashboard/vouchers', icon: TicketPercent },
    { name: t('projects.promotions'), url: '/dashboard/promotions', icon: BadgeDollarSign },
    { name: t('projects.tags'), url: '/dashboard/tags', icon: Tags },
    { name: t('projects.reviews'), url: '/dashboard/reviews', icon: MessageCircleMore },
    { name: t('projects.settings'), url: '#', icon: Settings }
  ]

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
