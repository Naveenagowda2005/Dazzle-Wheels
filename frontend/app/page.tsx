import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { SearchSection } from '@/components/home/search-section'
import { TrendingOffers } from '@/components/home/trending-offers'
import { FeaturedCars } from '@/components/home/featured-cars'
import { HowItWorks } from '@/components/home/how-it-works'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { Testimonials } from '@/components/home/testimonials'
import { CallToAction } from '@/components/home/call-to-action'
import { FaqSection } from '@/components/home/faq-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/5 to-orange-400/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <SearchSection />
          <TrendingOffers />
          <FeaturedCars />
          <HowItWorks />
          <WhyChooseUs />
          <Testimonials />
          <FaqSection />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  )
}