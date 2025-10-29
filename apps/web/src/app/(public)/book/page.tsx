import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Scissors, User } from 'lucide-react'

export default function BookPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Schedule your visit in just a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Choose Date & Time</CardTitle>
              <CardDescription>
                Select your preferred appointment date and time slot
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <Scissors className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Select Service</CardTitle>
              <CardDescription>
                Pick from our range of professional barbering services
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <User className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Choose Barber</CardTitle>
              <CardDescription>
                Select your preferred barber or let us choose for you
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Confirm Booking</CardTitle>
              <CardDescription>
                Review and confirm your appointment details
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to book?</h3>
              <p className="text-muted-foreground">
                Our full booking system will be available soon. Check back later!
              </p>
              <Button size="lg" className="mt-4">
                Start Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
