'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, User, ArrowRight } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import api from '@/lib/api'

interface Blog {
  id: string; title: string; slug: string; content: string
  featured_image?: string; meta_description?: string; category?: string
  published: boolean; created_at: string; updated_at: string
}

const cardAccents = [
  'border-violet-500/30 hover:border-violet-500/60',
  'border-pink-500/30 hover:border-pink-500/60',
  'border-blue-500/30 hover:border-blue-500/60',
]
const categoryColors = [
  'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
]

export function BlogPageContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery(
    ['blogs', page, searchTerm],
    async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '9')
      params.set('published', 'true')
      const response = await api.get(`/blogs?${params.toString()}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const filteredBlogs = data?.blogs?.filter((blog: Blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.meta_description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatDate = (d: string) => {
    if (!d) return ''
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  const truncate = (s: string, n = 150) => s.length <= n ? s : s.substring(0, n) + '...'

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
            <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">Our Blog</span>
            <h1 className="text-4xl font-bold text-white mb-4">Car Rental Blog</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Discover travel tips, car reviews, and expert advice for your next adventure</p>
          </div>

          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <ClientOnly fallback={<div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"/>}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              </ClientOnly>
              <Input placeholder="Search blog posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500"/>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <div className="h-48 bg-white/10"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12"><p className="text-slate-400">Failed to load blog posts.</p></div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12"><p className="text-slate-400">{searchTerm ? 'No posts found.' : 'No blog posts available yet.'}</p></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog: Blog, i: number) => (
                  <div key={blog.id} className={`rounded-2xl bg-white/5 border ${cardAccents[i % 3]} backdrop-blur-sm overflow-hidden hover:bg-white/8 transition-all duration-300 hover:scale-[1.02]`}>
                    {blog.featured_image && (
                      <div className="h-48 overflow-hidden">
                        <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                      </div>
                    )}
                    <div className="p-6">
                      {blog.category && (
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${categoryColors[i % 4]}`}>{blog.category}</span>
                      )}
                      <h2 className="text-lg font-bold text-white mb-3 line-clamp-2">{blog.title}</h2>
                      <p className="text-slate-400 mb-4 line-clamp-3 text-sm">{blog.meta_description || truncate(blog.content)}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <ClientOnly fallback={<div className="w-3 h-3"/>}><Calendar className="w-3 h-3"/></ClientOnly>
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClientOnly fallback={<div className="w-3 h-3"/>}><User className="w-3 h-3"/></ClientOnly>
                          <span>Admin</span>
                        </div>
                      </div>
                      <Link href={`/blog/${blog.slug}`}>
                        <Button variant="outline" className="w-full group border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:text-white">
                          Read More
                          <ClientOnly fallback={<div className="w-4 h-4 ml-2"/>}><ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/></ClientOnly>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {data?.pagination?.pages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                  {[...Array(data.pagination.pages)].map((_, i) => (
                    <Button key={i} size="sm" onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}>
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  )
}