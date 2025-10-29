'use client'

import { Clock, Scissors } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Service } from '@/types/service'
import { formatPrice, formatDuration, getCategoryDisplayName } from '@/lib/api/services'
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

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter()

  const handleBookNow = () => {
    router.push(`/book?serviceId=${service.id}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {/* Service Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Scissors className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
            {getCategoryDisplayName(service.category)}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(service.duration)}</span>
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-primary">
            {formatPrice(service.price)}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleBookNow}
          className="w-full"
          size="lg"
        >
          Reservar Ahora
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Service Card Skeleton
 * Loading state for service card
 */
export function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full bg-muted animate-pulse" />

      <CardHeader>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>

      <CardFooter>
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  )
}
