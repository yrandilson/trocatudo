import { defineStore } from 'pinia';
import { ref } from 'vue';
import { categoriesAPI } from '@/services/api';
import type { Category } from '@/types';

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories() {
    if (categories.value.length > 0) return; // Evita recarregar

    loading.value = true;
    error.value = null;
    try {
      const response = await categoriesAPI.getAll();
      categories.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar categorias';
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
});