'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import type { BarberFilters } from '@/types/barber'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface BarberFiltersProps {
  filters: BarberFilters
  onFiltersChange: (filters: BarberFilters) => void
}

const COMMON_SPECIALTIES = [
  'Corte Clásico',
  'Corte Moderno',
  'Barba',
  'Afeitado',
  'Degradado',
  'Diseño'
]

export function BarberFilters({ filters, onFiltersChange }: BarberFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleSpecialtyChange = (specialty: string) => {
    if (specialty === 'all') {
      onFiltersChange({ ...filters, specialty: undefined })
    } else {
      onFiltersChange({ ...filters, specialty })
    }
  }

  const handleAvailabilityChange = (available: string) => {
    if (available === 'all') {
      onFiltersChange({ ...filters, available: undefined })
    } else {
      onFiltersChange({ ...filters, available: available === 'true' })
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const hasActiveFilters = filters.search || filters.specialty || filters.available !== undefined

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar barberos por nombre..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Availability Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Disponibilidad:</span>
        <Tabs
          value={filters.available === undefined ? 'all' : filters.available.toString()}
          onValueChange={handleAvailabilityChange}
        >
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="true">Disponibles</TabsTrigger>
            <TabsTrigger value="false">Ocupados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Specialty Filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Especialidades:</span>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!filters.specialty ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleSpecialtyChange('all')}
          >
            Todas
          </Badge>
          {COMMON_SPECIALTIES.map((specialty) => (
            <Badge
              key={specialty}
              variant={filters.specialty === specialty ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleSpecialtyChange(specialty)}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {filters.search && (
              <span>
                Búsqueda: &quot;{filters.search}&quot;
              </span>
            )}
            {filters.search && filters.specialty && <span>|</span>}
            {filters.specialty && <span>Especialidad: {filters.specialty}</span>}
            {(filters.search || filters.specialty) && filters.available !== undefined && <span>|</span>}
            {filters.available !== undefined && (
              <span>{filters.available ? 'Solo disponibles' : 'Solo ocupados'}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
