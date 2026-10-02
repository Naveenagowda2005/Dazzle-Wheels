'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', details: ['Ground floor building no /flat no 14/2', 'muneshwara layout road tumkur road', 'totadaguddadahalli anche palya', 'bengaluru madanayakanahalli 560073'], gradient: 'from-violet-500 to-purple-600', type: 'map' },
    { icon: Phone, title: 'Call Us', details: ['+91 9972427475'], gradient: 'from-pink-500 to-rose-600', type: 'phone' },
    { icon: Mail, title: 'Email Us', details: ['dazzlewheels9@gmail.com'], gradient: 'from-blue-500 to-cyan-600', type: 'email' },
    { icon: Clock, title: 'Business Hours', details: ['Mon - Fri: 8:00 AM - 8:00 PM', 'Sat - Sun: 9:00 AM - 6:00 PM'], gradient: 'from-emerald-500 to-teal-600', type: 'hours' },
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
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">Get In Touch</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Have questions? We are here to help. Reach out anytime.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-300">Full Name *</label>
                      <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 [color-scheme:dark]"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-300">Email Address *</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your email" required
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 [color-scheme:dark]"/>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-300">Phone Number</label>
                      <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Your phone"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 [color-scheme:dark]"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-300">Subject *</label>
                      <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="What is this about?" required
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 [color-scheme:dark]"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-300">Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={5} required
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"/>
                  </div>
                  <Button type="submit" size="lg" disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 border-0">
                    {isSubmitting ? 'Sending...' : (
                      <>
                        <ClientOnly fallback={<div className="w-4 h-4 mr-2"/>}><Send className="w-4 h-4 mr-2"/></ClientOnly>
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              {contactInfo.map((info, i) => (
                <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/8 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                      <ClientOnly fallback={<div className="w-5 h-5"/>}><info.icon className="w-5 h-5 text-white"/></ClientOnly>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                      {info.details.map((d, j) => (
                        info.type === 'phone' ? <a key={j} href={`tel:${d.replace(/\s/g,'')}`} className="text-violet-300 hover:text-violet-200 text-sm block">{d}</a>
                        : info.type === 'email' ? <a key={j} href={`mailto:${d}`} className="text-violet-300 hover:text-violet-200 text-sm block">{d}</a>
                        : info.type === 'map' ? <a key={j} href="https://share.google/rMSAh6qIw5d22QYSp" target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200 text-sm block">{d}</a>
                        : <p key={j} className="text-slate-400 text-sm">{d}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency */}
          <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-red-300 mb-2">Emergency Support</h3>
            <p className="text-red-400/80 mb-4">Need immediate assistance? Our 24/7 emergency support is here.</p>
            <a href="tel:+919972427475">
              <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10 hover:text-red-200">
                <ClientOnly fallback={<div className="w-4 h-4 mr-2"/>}><Phone className="w-4 h-4 mr-2"/></ClientOnly>
                Call Emergency: +91 9972427475
              </Button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}