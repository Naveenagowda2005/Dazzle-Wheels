'use client'

import { useQuery } from 'react-query'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import api from '@/lib/api'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  featured_image?: string
  meta_description?: string
  seo_keywords?: string
  category?: string
  published: boolean
  created_at: string
  updated_at: string
}

interface BlogPostContentProps {
  slug: string
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const { data: blog, isLoading, error } = useQuery(
    ['blog', slug],
    async () => {
      const response = await api.get(`/blogs/slug/${slug}`)
      return response.data
    }
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatContent = (content: string) => {
    // Simple formatting - convert line breaks to paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
              <p className="text-gray-600 mb-8">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/blog">
                <Button>
                  <ClientOnly fallback={<div className="w-4 h-4 mr-2" />}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </ClientOnly>
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="outline" size="sm">
              <ClientOnly fallback={<div className="w-4 h-4 mr-2" />}>
                <ArrowLeft className="w-4 h-4 mr-2" />
              </ClientOnly>
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Blog Post */}
        <Card>
          {blog.featured_image && (
            <div className="h-64 md:h-96 overflow-hidden rounded-t-lg">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className="p-8">
            {/* Category */}
            {blog.category && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  <ClientOnly fallback={<div className="w-4 h-4 mr-1" />}>
                    <Tag className="w-4 h-4 mr-1" />
                  </ClientOnly>
                  {blog.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8 pb-8 border-b">
              <div className="flex items-center space-x-2">
                <ClientOnly fallback={<div className="w-4 h-4" />}>
                  <Calendar className="w-4 h-4" />
                </ClientOnly>
                <span>Published on {formatDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClientOnly fallback={<div className="w-4 h-4" />}>
                  <User className="w-4 h-4" />
                </ClientOnly>
                <span>By Admin</span>
              </div>
            </div>

            {/* Meta Description */}
            {blog.meta_description && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-8 border border-indigo-100">
                <p className="text-lg text-gray-700 italic">
                  {blog.meta_description}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {formatContent(blog.content)}
            </div>

            {/* SEO Keywords */}
            {blog.seo_keywords && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.seo_keywords.split(',').map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Posts / Back to Blog */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button size="lg">
              Explore More Articles
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
      </div>
    </div>
  )
}