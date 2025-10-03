import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'
import { UserRole } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN)
  const isModerator = computed(() => 
    user.value?.role === UserRole.MODERATOR || user.value?.role === UserRole.ADMIN
  )

  async function register(data: RegisterData) {
    loading.value = true
    error.value = null
    try {
      await authAPI.register(data)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao registrar'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.login(credentials)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao fazer login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return
    
    try {
      const response = await authAPI.me()
      user.value = response.data
    } catch (err) {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isModerator,
    register,
    login,
    fetchUser,
    logout
  }
})
