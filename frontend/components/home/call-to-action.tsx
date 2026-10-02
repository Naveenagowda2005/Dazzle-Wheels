import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Phone, Sparkles } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

export function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-700 to-pink-700"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6">
            <ClientOnly fallback={<div className="w-4 h-4"/>}>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </ClientOnly>
            Best Rates in Bangalore
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Ready to Start Your<br />
            <span className="text-yellow-300">Dream Journey?</span>
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Book your perfect car today and experience the freedom of self-drive rentals with Dazzle Wheels
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cars">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-xl shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all">
                Book Your Car Now
                <ClientOnly fallback={<div className="ml-2 w-5 h-5" />}>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </ClientOnly>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-yellow-400/60 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200 backdrop-blur-sm">
              <ClientOnly fallback={<div className="mr-2 w-5 h-5" />}>
                <Phone className="mr-2 w-5 h-5" />
              </ClientOnly>
              Call +91 9972427475
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-purple-200">
            <span>✓ Available 24/7</span>
            <span>✓ Instant Booking</span>
            <span>✓ Best Prices Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  )
}