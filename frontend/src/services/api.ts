import axios from 'axios'
import type { 
  User, 
  Item, 
  Proposta, 
  LoginCredentials, 
  RegisterData,
  PaginationResponse 
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authAPI = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (credentials: LoginCredentials) => api.post('/auth/login', credentials),
  me: () => api.get<User>('/auth/me')
}

// Items
export const itemsAPI = {
  getAll: (page = 1, limit = 10, categoria?: string, status?: string) => 
    api.get<PaginationResponse<Item>>('/items', { 
      params: { page, limit, categoria, status } 
    }),
  getById: (id: number) => api.get<Item>(`/items/${id}`),
  create: (data: Partial<Item>) => api.post('/items', data),
  update: (id: number, data: Partial<Item>) => api.put(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
  myItems: () => api.get<Item[]>('/items/my/items'),
  uploadImages: (id: number, formData: FormData) => 
    api.post(`/items/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  removeImage: (id: number, imageIndex: number) => 
    api.delete(`/items/${id}/images`, {
      data: { imageIndex }
    })
}

// Propostas
export const propostasAPI = {
  create: (data: { itemId: number; mensagem?: string }) => 
    api.post('/propostas', data),
  received: () => api.get<Proposta[]>('/propostas/received'),
  sent: () => api.get<Proposta[]>('/propostas/sent'),
  updateStatus: (id: number, status: string) => 
    api.patch(`/propostas/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/propostas/${id}`)
}

// Users (Admin only)
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`)
}

export default api
