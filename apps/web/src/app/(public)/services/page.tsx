import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scissors, Sparkles, Brush, Palette } from 'lucide-react'

const services = [
  {
    icon: Scissors,
    title: 'Haircut',
    description: 'Professional haircut tailored to your style',
    duration: '30-45 min',
    price: '$25'
  },
  {
    icon: Sparkles,
    title: 'Beard Trim',
    description: 'Expert beard shaping and grooming',
    duration: '20-30 min',
    price: '$15'
  },
  {
    icon: Brush,
    title: 'Styling',
    description: 'Complete hair styling for special occasions',
    duration: '45-60 min',
    price: '$40'
  },
  {
    icon: Palette,
    title: 'Coloring',
    description: 'Professional hair coloring services',
    duration: '90-120 min',
    price: '$80'
  }
]

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional barbershop services delivered by experienced barbers
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  <Icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-primary">{service.price}</span>
                </div>
                <Button className="w-full">Book Now</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
