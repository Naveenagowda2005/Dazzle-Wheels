import { Search, Calendar, Car, CheckCircle } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

const steps = [
  { icon: Search, title: 'Search & Select', description: 'Browse our fleet and choose your perfect car', gradient: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50', num: 'bg-yellow-400' },
  { icon: Calendar, title: 'Book Online', description: 'Select dates and complete your booking instantly', gradient: 'from-pink-500 to-rose-600', bg: 'from-pink-50 to-rose-50', num: 'bg-pink-400' },
  { icon: Car, title: 'Pick Up', description: 'Collect your car and start your journey', gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50 to-cyan-50', num: 'bg-blue-400' },
  { icon: CheckCircle, title: 'Enjoy & Return', description: 'Drive safely and return at your convenience', gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', num: 'bg-emerald-400' },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4 border border-purple-500/30">Simple Process</span>
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">Rent a car in just 4 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0"></div>
              )}
              <div className="relative z-10 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <ClientOnly fallback={<div className="w-8 h-8" />}>
                    <step.icon className="w-8 h-8 text-white" />
                  </ClientOnly>
                </div>
                <div className={`absolute -top-2 -right-2 w-7 h-7 ${step.num} rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                  {index + 1}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-purple-300 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}