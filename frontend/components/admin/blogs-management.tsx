'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Calendar,
  User,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import toast from 'react-hot-toast'
import authenticatedAPI from '@/lib/authenticated-api'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  featuredImage?: string
  metaDescription?: string
  seoKeywords?: string
  category?: string
  published: boolean
  created_at: string
  updated_at: string
}

export function BlogsManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featuredImage: '',
    metaDescription: '',
    seoKeywords: '',
    category: '',
    published: false
  })

  // Fetch blogs
  useEffect(() => {
    fetchBlogs()
    const interval = setInterval(fetchBlogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await authenticatedAPI.get('/blogs')
      setBlogs(Array.isArray(response) ? response : response.blogs || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData({ ...formData, featuredImage: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const session = JSON.parse(localStorage.getItem('dazzle_session') || '{}')
      const token = session.access_token

      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('content', formData.content)
      fd.append('metaDescription', formData.metaDescription)
      fd.append('seoKeywords', formData.seoKeywords)
      fd.append('category', formData.category)
      fd.append('published', String(formData.published))
      if (!imageFile && formData.featuredImage) {
        fd.append('featuredImageUrl', formData.featuredImage)
      }
      if (imageFile) {
        fd.append('featuredImage', imageFile)
      }

      const url = editingBlog
        ? `${API_URL}/blogs/${editingBlog.id}`
        : `${API_URL}/blogs`
      const method = editingBlog ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to save blog')
      }

      toast.success(editingBlog ? 'Blog updated!' : 'Blog created!')
      resetForm()
      fetchBlogs()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save blog')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      content: blog.content,
      featuredImage: blog.featuredImage || '',
      metaDescription: blog.metaDescription || '',
      seoKeywords: blog.seoKeywords || '',
      category: blog.category || '',
      published: blog.published
    })
    setImageFile(null)
    setImagePreview(blog.featuredImage || '')
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return
    
    try {
      await authenticatedAPI.delete(`/blogs/${id}`)
      toast.success('Blog deleted successfully!')
      fetchBlogs()
    } catch (error: any) {
      console.error('Error deleting blog:', error)
      toast.error('Failed to delete blog')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      featuredImage: '',
      metaDescription: '',
      seoKeywords: '',
      category: '',
      published: false
    })
    setEditingBlog(null)
    setImageFile(null)
    setImagePreview('')
    setShowAddForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {editingBlog ? 'Edit Blog' : 'Add New Blog'}
          </h1>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Car Reviews, Tips, News"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your blog content here..."
                  rows={10}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Featured Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-32 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {!imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  placeholder="Brief description for SEO (150-160 characters)"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Keywords</label>
                <Input
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})}
                  placeholder="car rental, travel, tips (comma separated)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blogs Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <ClientOnly fallback={<div className="w-4 h-4 mr-2" />}>
            <Plus className="w-4 h-4 mr-2" />
          </ClientOnly>
          Add New Blog
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}>
              <Search className="w-4 h-4 text-gray-400" />
            </ClientOnly>
            <Input
              placeholder="Search blogs by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blogs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Blogs ({filteredBlogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-8">
              <ClientOnly fallback={<div className="w-12 h-12 mx-auto mb-4" />}>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              </ClientOnly>
              <p className="text-gray-600">No blogs found</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                Create Your First Blog
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{blog.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          blog.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      {blog.category && (
                        <p className="text-sm text-blue-600 mb-2">#{blog.category}</p>
                      )}
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {blog.metaDescription || blog.content.substring(0, 150) + '...'}
                      </p>                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClientOnly fallback={<div className="w-3 h-3" />}>
                            <Calendar className="w-3 h-3" />
                          </ClientOnly>
                          <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClientOnly fallback={<div className="w-3 h-3" />}>
                            <User className="w-3 h-3" />
                          </ClientOnly>
                          <span>Admin</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        <ClientOnly fallback={<div className="w-4 h-4" />}>
                          <Edit className="w-4 h-4" />
                        </ClientOnly>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ClientOnly fallback={<div className="w-4 h-4" />}>
                          <Trash2 className="w-4 h-4" />
                        </ClientOnly>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}