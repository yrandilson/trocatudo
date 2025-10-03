import { defineStore } from 'pinia'
import { ref } from 'vue'
import { itemsAPI } from '@/services/api'
import type { Item, PaginationResponse } from '@/types'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const currentItem = ref<Item | null>(null)
  const myItems = ref<Item[]>([])
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(page = 1, categoria?: string, status?: string) {
    loading.value = true
    error.value = null
    try {
      const response = await itemsAPI.getAll(page, pagination.value.limit, categoria, status)
      items.value = response.data.items
      pagination.value = response.data.pagination
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar itens'
    } finally {
      loading.value = false
    }
  }

  async function fetchItemById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await itemsAPI.getById(id)
      currentItem.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar item'
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: Partial<Item>) {
    loading.value = true
    error.value = null
    try {
      await itemsAPI.create(data)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar item'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: number, data: Partial<Item>) {
    loading.value = true
    error.value = null
    try {
      await itemsAPI.update(id, data)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar item'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id: number) {
    loading.value = true
    error.value = null
    try {
      await itemsAPI.delete(id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao deletar item'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMyItems() {
    loading.value = true
    error.value = null
    try {
      const response = await itemsAPI.myItems()
      myItems.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar seus itens'
    } finally {
      loading.value = false
    }
  }

  // Novos métodos para upload de imagens
  async function uploadImages(id: number, formData: FormData) {
    loading.value = true
    error.value = null
    try {
      const response = await itemsAPI.uploadImages(id, formData)
      
      // Atualizar o item na lista se ele existir
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], imagens: response.data.imagens }
      }
      
      // Atualizar currentItem se for o mesmo
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = { ...currentItem.value, imagens: response.data.imagens }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao enviar imagens'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeImage(id: number, imageIndex: number) {
    loading.value = true
    error.value = null
    try {
      const response = await itemsAPI.removeImage(id, imageIndex)
      
      // Atualizar o item na lista se ele existir
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], imagens: response.data.imagens }
      }
      
      // Atualizar currentItem se for o mesmo
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = { ...currentItem.value, imagens: response.data.imagens }
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover imagem'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    currentItem,
    myItems,
    pagination,
    loading,
    error,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    fetchMyItems,
    uploadImages,
    removeImage
  }
})
