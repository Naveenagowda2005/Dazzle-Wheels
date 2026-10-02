'use client'

import { Suspense } from 'react'
import { CarsPageContent } from './cars-content'

export default function CarsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarsPageContent />
    </Suspense>
  )
}