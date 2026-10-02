import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dazzle Wheels - Premium Car Rental Service',
  description: 'Rent premium cars in Bangalore with Dazzle Wheels. Easy booking, competitive prices, and excellent service.',
  keywords: 'car rental, Bangalore, premium cars, self drive, Dazzle Wheels',
  authors: [{ name: 'Dazzle Wheels' }],
  openGraph: {
    title: 'Dazzle Wheels - Premium Car Rental Service',
    description: 'Rent premium cars in Bangalore with Dazzle Wheels. Easy booking, competitive prices, and excellent service.',
    url: 'https://dazzlewheels.com',
    siteName: 'Dazzle Wheels',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dazzle Wheels - Premium Car Rental Service',
    description: 'Rent premium cars in Bangalore with Dazzle Wheels. Easy booking, competitive prices, and excellent service.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18389564470"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18389564470');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <AuthProvider>
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}