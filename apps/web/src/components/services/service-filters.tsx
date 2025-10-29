'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import type { ServiceCategory, ServiceFilters } from '@/types/service'
import { getCategoryDisplayName } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ServiceFiltersProps {
  filters: ServiceFilters
  onFiltersChange: (filters: ServiceFilters) => void
}

const CATEGORIES: ServiceCategory[] = ['HAIRCUT', 'BEARD', 'COMBO', 'TREATMENT', 'OTHER']

export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      onFiltersChange({ ...filters, category: undefined })
    } else {
      onFiltersChange({ ...filters, category: category as ServiceCategory })
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const hasActiveFilters = filters.search || filters.category

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar servicios..."
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

      {/* Category Tabs */}
      <Tabs
        value={filters.category || 'all'}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category}>
              {getCategoryDisplayName(category)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            {filters.search && `Búsqueda: "${filters.search}"`}
            {filters.search && filters.category && ' | '}
            {filters.category && getCategoryDisplayName(filters.category)}
          </p>
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
