import { Shield, Clock, Headphones, Star, CreditCard, MapPin } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

const features = [
  { icon: Shield, title: 'Verified Cars', description: 'All vehicles are thoroughly inspected and maintained', gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/25' },
  { icon: Clock, title: '24/7 Service', description: 'Round-the-clock customer support and assistance', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/25' },
  { icon: Headphones, title: 'Expert Support', description: 'Dedicated support team to help you anytime', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/25' },
  { icon: Star, title: 'Premium Quality', description: 'High-quality vehicles from trusted brands', gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25' },
  { icon: CreditCard, title: 'Easy Payment', description: 'Multiple payment options for your convenience', gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/25' },
  { icon: MapPin, title: 'Multiple Locations', description: 'Available across Bangalore for easy pickup', gradient: 'from-fuchsia-500 to-pink-600', glow: 'shadow-fuchsia-500/25' },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium mb-4 border border-indigo-500/30">Our Advantages</span>
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose Dazzle Wheels?</h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">Premium service and unmatched quality for every journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className={`group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl ${feature.glow}`}>
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <ClientOnly fallback={<div className="w-7 h-7" />}>
                  <feature.icon className="w-7 h-7 text-white" />
                </ClientOnly>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}