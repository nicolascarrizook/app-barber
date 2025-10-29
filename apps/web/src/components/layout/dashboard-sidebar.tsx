'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  BarChart3,
  Clock,
  UserCog
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    icon: Calendar
  },
  {
    href: '/dashboard/clients',
    label: 'Clients',
    icon: Users
  },
  {
    href: '/dashboard/barbers',
    label: 'Barbers',
    icon: UserCog
  },
  {
    href: '/dashboard/services',
    label: 'Services',
    icon: Scissors
  },
  {
    href: '/dashboard/availability',
    label: 'Availability',
    icon: Clock
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3
  }
]

const secondaryItems: NavItem[] = [
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r bg-background p-6">
      {/* Logo */}
      <div className="mb-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Scissors className="h-6 w-6" />
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
                          (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Secondary Navigation */}
      <nav className="flex flex-col gap-2">
        {secondaryItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
