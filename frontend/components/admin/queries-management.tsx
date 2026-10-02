'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import authenticatedAPI from '@/lib/authenticated-api'
import { Mail, Trash2, Eye, EyeOff, Phone, Clock, MessageSquare } from 'lucide-react'

export function QueriesManagement() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: queries = [], isLoading } = useQuery(
    'contact-queries',
    () => authenticatedAPI.get('/contact'),
    { refetchInterval: 15000 }
  )

  const markRead = useMutation(
    (id: string) => authenticatedAPI.patch(`/contact/${id}/read`, {}),
    { onSuccess: () => queryClient.invalidateQueries('contact-queries') }
  )

  const deleteQuery = useMutation(
    (id: string) => authenticatedAPI.delete(`/contact/${id}`),
    { onSuccess: () => queryClient.invalidateQueries('contact-queries') }
  )

  const unreadCount = queries.filter((q: any) => q.status === 'UNREAD').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Queries</h2>
          <p className="text-sm text-gray-500 mt-1">Messages from the contact form</p>
        </div>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-500">Loading queries...</div>
      )}

      {!isLoading && queries.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No queries yet</p>
          <p className="text-gray-400 text-sm mt-1">Messages from the contact form will appear here</p>
        </div>
      )}

      <div className="space-y-3">
        {queries.map((query: any) => {
          const isUnread = query.status === 'UNREAD'
          const isExpanded = expanded === query.id
          return (
            <div
              key={query.id}
              className={`bg-white rounded-xl border transition-all ${isUnread ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-gray-200'}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Unread dot */}
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isUnread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{query.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isUnread ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isUnread ? 'New' : 'Read'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{query.email}</span>
                        {query.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{query.phone}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(query.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm">{query.subject}</p>
                      {isExpanded && (
                        <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                          {query.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setExpanded(isExpanded ? null : query.id)
                        if (isUnread && !isExpanded) markRead.mutate(query.id)
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      title={isExpanded ? 'Collapse' : 'View message'}
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this query?')) deleteQuery.mutate(query.id) }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
