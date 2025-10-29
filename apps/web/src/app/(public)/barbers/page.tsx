import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

const barbers = [
  {
    name: 'Carlos Mendez',
    specialty: 'Master Barber',
    experience: '15 years',
    rating: 4.9,
    avatar: '/avatars/barber1.png',
    initials: 'CM'
  },
  {
    name: 'Juan Rodriguez',
    specialty: 'Hair Stylist',
    experience: '10 years',
    rating: 4.8,
    avatar: '/avatars/barber2.png',
    initials: 'JR'
  },
  {
    name: 'Miguel Santos',
    specialty: 'Beard Specialist',
    experience: '8 years',
    rating: 4.9,
    avatar: '/avatars/barber3.png',
    initials: 'MS'
  },
  {
    name: 'Diego Torres',
    specialty: 'Color Expert',
    experience: '12 years',
    rating: 4.7,
    avatar: '/avatars/barber4.png',
    initials: 'DT'
  }
]

export default function BarbersPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Barbers</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Meet our team of experienced professionals
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {barbers.map((barber) => (
          <Card key={barber.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={barber.avatar} alt={barber.name} />
                  <AvatarFallback className="text-lg">
                    {barber.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{barber.name}</CardTitle>
              <CardDescription>{barber.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{barber.rating}</span>
                <span className="text-sm text-muted-foreground">rating</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {barber.experience} experience
              </p>
              <Button className="w-full">Book with {barber.name.split(' ')[0]}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
