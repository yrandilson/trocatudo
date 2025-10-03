import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersAPI } from '@/services/api'
import type { User, UserRole } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.getAll()
      users.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar usuários'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.getById(id)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, data: { nome?: string; email?: string; role?: UserRole }) {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.update(id, data)
      
      // Atualizar o usuário na lista
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...data }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number) {
    loading.value = true
    error.value = null
    try {
      await usersAPI.delete(id)
      
      // Remover o usuário da lista
      users.value = users.value.filter(user => user.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser
  }
})
