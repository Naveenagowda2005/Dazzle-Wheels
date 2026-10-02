import Cookies from 'js-cookie'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
}

export const getUser = (): User | null => {
  const userCookie = Cookies.get('user')
  if (!userCookie) return null
  
  try {
    return JSON.parse(userCookie)
  } catch {
    return null
  }
}

export const setUser = (user: User, token: string) => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 })
  Cookies.set('token', token, { expires: 7 })
}

export const removeUser = () => {
  Cookies.remove('user')
  Cookies.remove('token')
}

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token')
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role === 'ADMIN'
}