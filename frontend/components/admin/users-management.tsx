'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User, Mail, Phone, Calendar, Eye, Edit, Trash2, X } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserType {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  bookings?: any[]
}

export function UsersManagement() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewUser, setViewUser] = useState<UserType | null>(null)
  const [editUser, setEditUser] = useState<UserType | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin-users', page], async () => {
    const response = await api.get(`/users?page=${page}&limit=10`)
    return response.data
  }, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.patch(`/users/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users'])
        toast.success('User updated successfully')
        setEditUser(null)
      },
      onError: () => { toast.error('Failed to update user') },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/users/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users'])
        toast.success('User deleted successfully')
      },
      onError: () => { toast.error('Failed to delete user') },
    }
  )

  const handleEdit = (user: UserType) => {
    setEditUser(user)
    setEditForm({ name: user.name, phone: user.phone || '', role: user.role })
  }

  const handleDelete = (user: UserType) => {
    if (confirm(`Delete user ${user.name}? This cannot be undone.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    updateMutation.mutate({ id: editUser.id, data: editForm })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Users Management</h1>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  const filteredUsers = data?.users?.filter((user: UserType) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({data?.pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user: UserType) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setViewUser(user)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {[...Array(data.pagination.pages)].map((_, i) => (
            <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Details
                <Button variant="outline" size="sm" onClick={() => setViewUser(null)}><X className="w-4 h-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{viewUser.name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{viewUser.email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{viewUser.phone || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Role</p><p className="font-medium">{viewUser.role}</p></div>
              <div><p className="text-sm text-gray-500">Joined</p><p className="font-medium">{formatDate(viewUser.createdAt)}</p></div>
              <div><p className="text-sm text-gray-500">Total Bookings</p><p className="font-medium">{viewUser.bookings?.length || 0}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Edit User
                <Button variant="outline" size="sm" onClick={() => setEditUser(null)}><X className="w-4 h-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isLoading}>
                    {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
