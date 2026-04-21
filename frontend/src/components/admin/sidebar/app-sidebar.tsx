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

// This is sample data.
const data = {
  user: {
    name: 'VTech',
    email: 'vtech@gmail.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Vtech ',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: [
    {
      title: 'Products',
      url: '#',
      icon: Box,
      isActive: true,
      items: [
        {
          title: 'List Products',
          url: '/dashboard/products'
        },
        {
          title: 'Colors',
          url: '/dashboard/colors'
        },
        {
          title: 'Versions',
          url: '/dashboard/versions'
        },

        {
          title: 'Receipt',
          url: '#'
        }
      ]
    },
    {
      title: 'Orders',
      url: '#',
      icon: ShoppingCart,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Categories',
      url: '/dashboard/categories',
      icon: ListCollapseIcon
    },
    {
      name: 'Brands',
      url: '/dashboard/brands',
      icon: CircleStar
    },
    {
      name: 'Blog',
      url: '/dashboard/blogs',
      icon: StickyNote
    },
    {
      name: 'Users',
      url: '/dashboard/users',
      icon: Users2
    },
    {
      name: 'Vouchers',
      url: '/dashboard/vouchers',
      icon: TicketPercent
    },
    {
      name: 'Promotions',
      url: '/dashboard/promotions',
      icon: BadgeDollarSign
    },
    {
      name: 'Tags',
      url: '/dashboard/tags',
      icon: Tags
    },
    {
      name: 'Reviews',
      url: '/dashboard/reviews',
      icon: MessageCircleMore
    },
    {
      name: 'Settings',
      url: '#',
      icon: Settings
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  // Ưu tiên lấy username từ token, nếu không có thì mới fallback cắt từ email
  const userData = {
    name: user?.username || user?.sub?.split('@')[0] || 'VTech Admin',
    email: user?.sub || 'vtech@gmail.com',
    avatar: user?.avatar || 'https://ui.shadcn.com/avatars/02.png' // Ưu tiên avatar từ DB
  }
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
