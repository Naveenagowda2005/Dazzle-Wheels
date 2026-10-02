import { Injectable } from '@nestjs/common'

@Injectable()
export class DatabaseService {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://gqrwjafrebbgpvkfphzw.supabase.co'
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    console.log('🔍 Database Service initialized:')
    console.log('   - URL:', this.supabaseUrl)
    console.log('   - Key type:', this.supabaseKey?.includes('service_role') ? 'SERVICE_ROLE' : 'ANON')
  }

  // Execute raw SQL query using Supabase RPC
  async executeSQL(query: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query,
          params 
        })
      })

      if (!response.ok) {
        throw new Error(`SQL query failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('SQL execution error:', error)
      throw error
    }
  }

  // SELECT queries
  async select(table: string, columns: string = '*', where: string = '', params: any[] = []): Promise<any[]> {
    try {
      console.log(`🔍 Querying ${table} table...`)
      
      let url = `${this.supabaseUrl}/rest/v1/${table}?select=${columns}`
      if (where) {
        url += `&${where}`
      }
      
      console.log('   - URL:', url)
      console.log('   - Using key:', this.supabaseKey?.substring(0, 20) + '...')
      
      const response = await fetch(url, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('   - Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('   - Error response:', errorText)
        throw new Error(`SELECT query failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`   ✅ Success: Found ${data.length} records`)
      return data
    } catch (error) {
      console.error('SELECT query error:', error)
      throw error
    }
  }

  // INSERT queries
  async insert(table: string, data: any): Promise<any> {
    try {
      const cleanData = this.toSnakeCase(data)

      const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(cleanData)
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`INSERT error body for ${table}:`, errorBody)
        throw new Error(`INSERT query failed: ${response.status} ${response.statusText} - ${errorBody}`)
      }

      return await response.json()
    } catch (error) {
      console.error('INSERT query error:', error)
      throw error
    }
  }

  // UPDATE queries
  async update(table: string, data: any, where: string): Promise<any> {
    try {
      // Strip undefined values and camelCase keys — Supabase expects snake_case
      const cleanData = this.toSnakeCase(data)

      const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}?${where}`, {
        method: 'PATCH',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(cleanData)
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`UPDATE error body for ${table}:`, errorBody)
        throw new Error(`UPDATE query failed: ${response.status} ${response.statusText} - ${errorBody}`)
      }

      const text = await response.text()
      return text ? JSON.parse(text) : null
    } catch (error) {
      console.error('UPDATE query error:', error)
      throw error
    }
  }

  // DELETE queries
  async delete(table: string, where: string): Promise<any> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}?${where}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`DELETE error body for ${table}:`, errorBody)
        throw new Error(`DELETE query failed: ${response.status} ${response.statusText} - ${errorBody}`)
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        return text ? JSON.parse(text) : null
      }
      
      // For DELETE operations, often return empty response
      return null
    } catch (error) {
      console.error('DELETE query error:', error)
      throw error
    }
  }

  // COUNT queries
  async count(table: string, where: string = ''): Promise<number> {
    try {
      const url = `${this.supabaseUrl}/rest/v1/${table}?select=count${where ? `&${where}` : ''}`
      const response = await fetch(url, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      })

      if (!response.ok) {
        throw new Error(`COUNT query failed: ${response.status} ${response.statusText}`)
      }

      const countHeader = response.headers.get('content-range')
      if (countHeader) {
        const match = countHeader.match(/\/(\d+)$/)
        return match ? parseInt(match[1]) : 0
      }

      return 0
    } catch (error) {
      console.error('COUNT query error:', error)
      return 0
    }
  }

  // Aggregate functions
  async sum(table: string, column: string, where: string = ''): Promise<number> {
    try {
      const data = await this.select(table, column, where)
      return data.reduce((sum, row) => sum + (parseFloat(row[column]) || 0), 0)
    } catch (error) {
      console.error('SUM query error:', error)
      return 0
    }
  }

  async avg(table: string, column: string, where: string = ''): Promise<number> {
    try {
      const data = await this.select(table, column, where)
      if (data.length === 0) return 0
      const sum = data.reduce((sum, row) => sum + (parseFloat(row[column]) || 0), 0)
      return sum / data.length
    } catch (error) {
      console.error('AVG query error:', error)
      return 0
    }
  }

  // Generate UUID
  generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Format date for SQL
  formatDate(date: Date): string {
    return date.toISOString()
  }

  // Parse SQL date
  parseDate(dateString: string): Date {
    return new Date(dateString)
  }

  // Convert camelCase object keys to snake_case for Supabase
  toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item))
    if (typeof obj !== 'object') return obj

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue // skip undefined values
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      result[snakeKey] = value
    }
    return result
  }
}