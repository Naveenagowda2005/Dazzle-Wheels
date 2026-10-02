'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

const faqs = [
  { question: 'What documents do I need to rent a car?', answer: "You need a valid driver's license, a government-issued ID, and a driving license image for verification. International customers may need an International Driving Permit." },
  { question: 'What is the minimum age to rent a car?', answer: 'The minimum age is 21 years old. Drivers under 25 may be subject to additional fees.' },
  { question: 'Can I modify or cancel my reservation?', answer: 'Yes, you can modify or cancel your reservation up to 24 hours before pickup without penalty. Contact our support team for assistance.' },
  { question: 'Do you offer insurance coverage?', answer: 'Yes, we offer comprehensive insurance packages. All rentals include basic coverage, with optional upgrades available.' },
  { question: 'How does the booking confirmation work?', answer: 'After submitting your booking, our admin team reviews your driving license and confirms the booking. You will see the status update in your dashboard.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit/debit cards and UPI payments. Payment is processed securely at the time of booking.' },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">FAQ</span>
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-pink-500 mx-auto rounded-full"></div>
          <p className="text-slate-400 mt-4">Everything you need to know about renting with Dazzle Wheels</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-violet-500/10 border-violet-500/40' : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'}`}>
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-white pr-4">{faq.question}</span>
                <ClientOnly fallback={<div className="w-5 h-5 shrink-0" />}>
                  {openIndex === index
                    ? <ChevronUp className="w-5 h-5 text-violet-400 shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  }
                </ClientOnly>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-violet-500/20 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}