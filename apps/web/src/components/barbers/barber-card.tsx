'use client'

import { Star, Award, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Barber } from '@/types/barber'
import {
  getBarberFullName,
  getBarberInitials,
  formatExperience,
  getStatusInfo,
  formatRating
} from '@/lib/api/barbers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

interface BarberCardProps {
  barber: Barber
  serviceId?: string
}

export function BarberCard({ barber, serviceId }: BarberCardProps) {
  const router = useRouter()
  const statusInfo = getStatusInfo(barber.status)

  const handleSelectBarber = () => {
    const params = new URLSearchParams()
    params.append('barberId', barber.id)
    if (serviceId) {
      params.append('serviceId', serviceId)
    }
    router.push(`/book?${params.toString()}`)
  }

  const isAvailable = barber.status === 'AVAILABLE' && barber.isActive

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={barber.photoUrl} alt={getBarberFullName(barber)} />
            <AvatarFallback className="text-lg">
              {getBarberInitials(barber)}
            </AvatarFallback>
          </Avatar>

          {/* Name and Status */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1">
              {getBarberFullName(barber)}
            </CardTitle>
            <Badge
              variant={statusInfo.variant}
              className={`${statusInfo.color} mb-2`}
            >
              {statusInfo.label}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{formatExperience(barber.yearsOfExperience)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {barber.bio && (
          <CardDescription className="line-clamp-2">
            {barber.bio}
          </CardDescription>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{formatRating(barber.rating)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({barber.reviewCount} {barber.reviewCount === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>

        {/* Specialties */}
        {barber.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {barber.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {barber.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{barber.specialties.length - 3} más
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleSelectBarber}
          className="flex-1"
          size="lg"
          disabled={!isAvailable}
        >
          {isAvailable ? (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Seleccionar Barbero
            </>
          ) : (
            'No Disponible'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Barber Card Skeleton
 * Loading state for barber card
 */
export function BarberCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>

      <CardFooter>
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  )
}
