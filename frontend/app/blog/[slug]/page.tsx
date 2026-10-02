'use client'

import { Suspense } from 'react'
import { BlogPostContent } from './blog-post-content'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPostContent slug={params.slug} />
    </Suspense>
  )
}