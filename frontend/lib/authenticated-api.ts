// Authenticated API service for admin operations
class AuthenticatedAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    try {
      const sessionData = localStorage.getItem('dazzle_session')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (session.access_token && session.expires_at > Date.now()) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }

    return headers
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Clear session and redirect to login
      localStorage.removeItem('dazzle_session')
      window.location.href = '/admin/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ')
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // 204 No Content has no body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }

    return null
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }
}

export const authenticatedAPI = new AuthenticatedAPI()
export default authenticatedAPI