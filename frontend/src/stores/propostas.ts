import { defineStore } from 'pinia'
import { ref } from 'vue'
import { propostasAPI } from '@/services/api'
import type { Proposta } from '@/types'

export const usePropostasStore = defineStore('propostas', () => {
  const propostasRecebidas = ref<Proposta[]>([])
  const propostasEnviadas = ref<Proposta[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createProposta(itemId: number, mensagem?: string) {
    loading.value = true
    error.value = null
    try {
      await propostasAPI.create({ itemId, mensagem })
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar proposta'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchPropostasRecebidas() {
    loading.value = true
    error.value = null
    try {
      const response = await propostasAPI.received()
      propostasRecebidas.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar propostas recebidas'
    } finally {
      loading.value = false
    }
  }

  async function fetchPropostasEnviadas() {
    loading.value = true
    error.value = null
    try {
      const response = await propostasAPI.sent()
      propostasEnviadas.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar propostas enviadas'
    } finally {
      loading.value = false
    }
  }

  async function updatePropostaStatus(id: number, status: string) {
    loading.value = true
    error.value = null
    try {
      await propostasAPI.updateStatus(id, status)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar proposta'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteProposta(id: number) {
    loading.value = true
    error.value = null
    try {
      await propostasAPI.delete(id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao deletar proposta'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    propostasRecebidas,
    propostasEnviadas,
    loading,
    error,
    createProposta,
    fetchPropostasRecebidas,
    fetchPropostasEnviadas,
    updatePropostaStatus,
    deleteProposta
  }
})
