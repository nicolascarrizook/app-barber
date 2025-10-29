'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

/**
 * Global providers for the application
 * Wraps children with TanStack Query and Theme providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data considered fresh for 60 seconds
            staleTime: 60 * 1000,
            // Don't refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Retry failed requests once
            retry: 1,
            // Cache time: Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000
          },
          mutations: {
            // Retry failed mutations once
            retry: 1
          }
        }
      })
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
