'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import type { ServiceFilters } from '@/types/service'
import { getServices } from '@/lib/api/services'
import { ServiceCard, ServiceCardSkeleton } from '@/components/services/service-card'
import { ServiceFilters as ServiceFiltersComponent } from '@/components/services/service-filters'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const [filters, setFilters] = useState<ServiceFilters>({})

  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['services', filters],
    queryFn: () => getServices(filters),
    retry: 1
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Nuestros Servicios</h1>
        <p className="text-lg text-muted-foreground">
          Descubre todos los servicios que ofrecemos para verte y sentirte mejor
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ServiceFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar servicios</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {error instanceof Error
                ? error.message
                : 'No se pudieron cargar los servicios. Por favor, intenta de nuevo.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && services && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && services && services.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.category
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'No hay servicios disponibles en este momento'}
          </p>
          {(filters.search || filters.category) && (
            <Button
              variant="outline"
              onClick={() => setFilters({})}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
