<template>
  <div class="filter-container">
    <div class="filter-header">
      <h3>Filtros</h3>
      <button @click="resetFilters" class="reset-button">
        <i class="fas fa-undo"></i> Limpar
      </button>
    </div>
    
    <div class="filter-section">
      <h4>Categorias</h4>
      <div class="filter-options">
        <label v-for="(label, value) in categorias" :key="value" class="filter-option">
          <input 
            type="checkbox" 
            :value="value" 
            v-model="selectedCategories"
            @change="applyFilters"
          />
          <span>{{ label }}</span>
        </label>
      </div>
    </div>
    
    <div class="filter-section">
      <h4>Status</h4>
      <div class="filter-options">
        <label v-for="(label, value) in statusOptions" :key="value" class="filter-option">
          <input 
            type="checkbox" 
            :value="value" 
            v-model="selectedStatus"
            @change="applyFilters"
          />
          <span>{{ label }}</span>
        </label>
      </div>
    </div>
    
    <div class="filter-section">
      <h4>Ordenar por</h4>
      <select v-model="sortBy" @change="applyFilters" class="sort-select">
        <option value="newest">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ItemCategoria, ItemStatus } from '@/types';

const props = defineProps<{
  initialCategories?: string[];
  initialStatus?: string[];
  initialSort?: string;
}>();

const emit = defineEmits<{
  (e: 'filter', filters: {
    categories: string[];
    status: string[];
    sort: string;
  }): void;
}>();

const selectedCategories = ref<string[]>(props.initialCategories || []);
const selectedStatus = ref<string[]>(props.initialStatus || []);
const sortBy = ref<string>(props.initialSort || 'newest');

const categorias = {
  [ItemCategoria.ELETRONICOS]: 'Eletrônicos',
  [ItemCategoria.VESTUARIO]: 'Vestuário',
  [ItemCategoria.MOVEIS]: 'Móveis',
  [ItemCategoria.LIVROS]: 'Livros',
  [ItemCategoria.ESPORTES]: 'Esportes',
  [ItemCategoria.OUTROS]: 'Outros'
};

const statusOptions = {
  [ItemStatus.DISPONIVEL]: 'Disponível',
  [ItemStatus.TROCADO]: 'Trocado'
};

const applyFilters = () => {
  emit('filter', {
    categories: selectedCategories.value,
    status: selectedStatus.value,
    sort: sortBy.value
  });
};

const resetFilters = () => {
  selectedCategories.value = [];
  selectedStatus.value = [];
  sortBy.value = 'newest';
  applyFilters();
};

// Aplicar filtros iniciais
watch(() => props.initialCategories, (newVal) => {
  if (newVal) selectedCategories.value = newVal;
}, { immediate: true });

watch(() => props.initialStatus, (newVal) => {
  if (newVal) selectedStatus.value = newVal;
}, { immediate: true });

watch(() => props.initialSort, (newVal) => {
  if (newVal) sortBy.value = newVal;
}, { immediate: true });
</script>

<style scoped>
.filter-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h3 {
  font-size: 18px;
  margin: 0;
}

.reset-button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.reset-button i {
  margin-right: 5px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section h4 {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filter-option input {
  margin-right: 10px;
}

.sort-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

@media (max-width: 768px) {
  .filter-container {
    margin-bottom: 20px;
  }
}
</style>
