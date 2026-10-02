import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Zap } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-t border-purple-800/30 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <ClientOnly fallback={<span className="text-white font-bold">D</span>}>
                  <Zap className="w-5 h-5 text-white" />
                </ClientOnly>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Dazzle Wheels</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premium car rental service in Bangalore. Experience the joy of driving with our well-maintained fleet of vehicles.
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-lg text-sm font-medium">
              📱 Mobile App Coming Soon
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/cars', label: 'Browse Cars' },
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-purple-300 transition-colors">{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {['Self Drive Cars', 'Hourly Rentals', 'Daily Rentals', 'Weekly Rentals', 'Monthly Rentals', '24/7 Support'].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:+919972427475" className="flex items-center space-x-3 text-slate-400 hover:text-purple-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                  <ClientOnly fallback={<div className="w-4 h-4" />}>
                    <Phone className="w-4 h-4 text-violet-400" />
                  </ClientOnly>
                </div>
                <span>+91 9972427475</span>
              </a>
              <a href="mailto:dazzlewheels9@gmail.com" className="flex items-center space-x-3 text-slate-400 hover:text-purple-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                  <ClientOnly fallback={<div className="w-4 h-4" />}>
                    <Mail className="w-4 h-4 text-violet-400" />
                  </ClientOnly>
                </div>
                <span>dazzlewheels9@gmail.com</span>
              </a>
              <a href="https://share.google/rMSAh6qIw5d22QYSp" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 text-slate-400 hover:text-purple-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center mt-0.5 group-hover:bg-violet-500/30 transition-colors shrink-0">
                  <ClientOnly fallback={<div className="w-4 h-4" />}>
                    <MapPin className="w-4 h-4 text-violet-400" />
                  </ClientOnly>
                </div>
                <span>Ground floor building no /flat no 14/2 muneshwara layout road tumkur road totadaguddadahalli anche palya bengaluru madanayakanahalli 560073</span>
              </a>
            </div>
            <div className="flex space-x-3 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-violet-500/30 hover:border-violet-500/50 transition-all">
                  <ClientOnly fallback={<div className="w-4 h-4" />}>
                    <Icon className="w-4 h-4" />
                  </ClientOnly>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-purple-800/30 mt-10 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2024 Dazzle Wheels. All rights reserved. Made with ❤️ in Bangalore</p>
        </div>
      </div>
    </footer>
  )
}