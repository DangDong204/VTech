'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom' // <-- IMPORT THÊM LINK NÀY

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // TRƯỜNG HỢP 1: NẾU CÓ MENU CON
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span className='flex-1'>{item.title}</span>

                      {!!item.badge && item.badge > 0 && (
                        <SidebarMenuBadge className='bg-red-500 text-white rounded-full px-2 w-auto min-w-[1.25rem] justify-center'>
                          {item.badge}
                        </SidebarMenuBadge>
                      )}

                      <ChevronRight className='transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {/* ĐÃ THAY a BẰNG Link */}
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // TRƯỜNG HỢP 2: KHÔNG CÓ MENU CON
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                {/* ĐÃ THAY a BẰNG Link */}
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span className='flex-1'>{item.title}</span>

                  {!!item.badge && item.badge > 0 && (
                    <SidebarMenuBadge className='bg-red-500 text-white rounded-full px-2 w-auto min-w-[1.25rem] justify-center'>
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
