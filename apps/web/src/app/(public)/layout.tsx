import { MainLayout } from '@/components/layout/main-layout'

interface PublicLayoutProps {
  children: React.ReactNode
}

/**
 * Public Layout
 * Used for public-facing pages (home, services, booking, about, etc.)
 * Includes header and footer
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}
