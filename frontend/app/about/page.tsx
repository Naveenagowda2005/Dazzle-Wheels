'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Car, Users, Shield, Award } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import Link from 'next/link'

export default function AboutPage() {
  const features = [
    { icon: Car, title: 'Premium Fleet', description: 'Wide selection of well-maintained vehicles from economy to luxury cars', gradient: 'from-violet-500 to-purple-600' },
    { icon: Users, title: 'Expert Team', description: 'Professional staff dedicated to providing exceptional customer service', gradient: 'from-pink-500 to-rose-600' },
    { icon: Shield, title: 'Secure & Safe', description: 'All vehicles are regularly inspected and fully insured for your safety', gradient: 'from-blue-500 to-cyan-600' },
    { icon: Award, title: 'Best Rates', description: 'Competitive pricing with transparent fees and no hidden charges', gradient: 'from-emerald-500 to-teal-600' },
  ]

  const stats = [
    { number: '10,000+', label: 'Happy Customers', color: 'text-violet-400' },
    { number: '500+', label: 'Vehicles Available', color: 'text-pink-400' },
    { number: '50+', label: 'Cities Covered', color: 'text-blue-400' },
    { number: '5', label: 'Years Experience', color: 'text-emerald-400' },
  ]

  const values = [
    { title: 'Reliability', desc: 'We ensure our vehicles are always in perfect condition and available when you need them.', color: 'border-violet-500/40' },
    { title: 'Transparency', desc: 'Clear pricing, honest communication, and no hidden fees — what you see is what you get.', color: 'border-pink-500/40' },
    { title: 'Excellence', desc: 'We strive for excellence in every aspect of our service, from booking to return.', color: 'border-blue-500/40' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">About Us</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Dazzle Wheels</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">Your trusted partner for premium car rental services. Committed to making your journey comfortable, safe, and memorable.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
                <div className={`text-3xl font-bold mb-2 ${s.color}`}>{s.number}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-slate-400 mb-4">Founded in 2019, Dazzle Wheels started with a simple mission: to provide reliable, affordable, and premium car rental services that exceed customer expectations.</p>
              <p className="text-slate-400 mb-4">What began as a small fleet of 10 vehicles has grown into a comprehensive car rental service with over 500 vehicles across 50+ cities. We've served more than 10,000 satisfied customers.</p>
              <p className="text-slate-400">Our commitment to quality, safety, and customer satisfaction has made us a trusted name in the car rental industry.</p>
            </div>
            <div className="rounded-2xl p-8 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-300 mb-6">To provide exceptional car rental experiences that empower people to explore, travel, and achieve their goals with confidence and convenience.</p>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-300">To be the leading car rental service that sets the standard for quality, innovation, and customer satisfaction in the industry.</p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Dazzle Wheels?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:scale-105 transition-all duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <ClientOnly fallback={<div className="w-7 h-7"/>}><f.icon className="w-7 h-7 text-white"/></ClientOnly>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-16 p-8 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className={`text-center p-6 rounded-xl border ${v.color} bg-white/3`}>
                  <h3 className="text-xl font-semibold text-white mb-3">{v.title}</h3>
                  <p className="text-slate-400 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-slate-400 mb-8">Browse our fleet and book your perfect car today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cars">
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 border-0">Browse Cars</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10 hover:text-white">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}