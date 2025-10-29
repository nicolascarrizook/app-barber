'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Users } from 'lucide-react'
import type { BarberFilters } from '@/types/barber'
import { getBarbers } from '@/lib/api/barbers'
import { BarberCard, BarberCardSkeleton } from '@/components/barbers/barber-card'
import { BarberFilters as BarberFiltersComponent } from '@/components/barbers/barber-filters'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function BarbersPage() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')

  const [filters, setFilters] = useState<BarberFilters>({})

  const {
    data: barbers,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['barbers', filters],
    queryFn: () => getBarbers(filters),
    retry: 1
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Nuestros Barberos</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Selecciona el barbero de tu preferencia para tu próxima cita
        </p>
        {serviceId && (
          <p className="text-sm text-muted-foreground mt-2">
            Los barberos mostrados pueden realizar el servicio seleccionado
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <BarberFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar barberos</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {error instanceof Error
                ? error.message
                : 'No se pudieron cargar los barberos. Por favor, intenta de nuevo.'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <BarberCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Barbers Grid */}
      {!isLoading && barbers && barbers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              serviceId={serviceId || undefined}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && barbers && barbers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron barberos
          </h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.specialty || filters.available !== undefined
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'No hay barberos disponibles en este momento'}
          </p>
          {(filters.search || filters.specialty || filters.available !== undefined) && (
            <Button
              variant="outline"
              onClick={() => setFilters({})}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && barbers && barbers.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Mostrando {barbers.length} {barbers.length === 1 ? 'barbero' : 'barberos'}
        </div>
      )}
    </div>
  )
}
