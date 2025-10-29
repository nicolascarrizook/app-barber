import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6" />
              <span className="font-bold text-lg">Barbershop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional barbershop management platform for modern businesses.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services/haircut" className="hover:text-primary transition-colors">
                  Haircut
                </Link>
              </li>
              <li>
                <Link href="/services/beard" className="hover:text-primary transition-colors">
                  Beard Trim
                </Link>
              </li>
              <li>
                <Link href="/services/styling" className="hover:text-primary transition-colors">
                  Styling
                </Link>
              </li>
              <li>
                <Link href="/services/coloring" className="hover:text-primary transition-colors">
                  Coloring
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/barbers" className="hover:text-primary transition-colors">
                  Our Barbers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Barbershop Management System. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="https://facebook.com" className="hover:text-primary transition-colors">
              Facebook
            </Link>
            <Link href="https://instagram.com" className="hover:text-primary transition-colors">
              Instagram
            </Link>
            <Link href="https://twitter.com" className="hover:text-primary transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
