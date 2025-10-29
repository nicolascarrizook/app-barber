import { Header } from './header'
import { Footer } from './footer'

interface MainLayoutProps {
  children: React.ReactNode
}

/**
 * Main Layout Component
 * Used for public-facing pages (home, services, about, etc.)
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
