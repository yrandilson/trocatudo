<template>
  <div class="item-card">
    <div class="item-status" :class="getStatusClass(item.status)">
      {{ getStatusLabel(item.status) }}
    </div>
    
    <div class="item-image">
      <img 
        v-if="item.imagens && item.imagens.length > 0" 
        :src="getImageUrl(item.imagens[0])" 
        alt="Item" 
      />
      <div v-else class="no-image">
        <i class="fas fa-image"></i>
      </div>
    </div>
    
    <div class="item-content">
      <h3 class="item-title">{{ item.titulo }}</h3>
      <div class="item-category">
        <span class="category-badge">{{ getCategoriaLabel(item.categoria) }}</span>
      </div>
      <p class="item-description">{{ truncateText(item.descricao, 100) }}</p>
      
      <div class="item-owner">
        <i class="fas fa-user"></i>
        <span>{{ item.user?.nome || 'Usuário' }}</span>
      </div>
    </div>
    
    <div class="item-footer">
      <router-link :to="`/items/${item.id}`" class="view-button">
        Ver Detalhes
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ItemCategoria, ItemStatus, type Item } from '@/types';

const props = defineProps<{
  item: Item;
}>();

const getCategoriaLabel = (categoria: ItemCategoria) => {
  const labels = {
    [ItemCategoria.ELETRONICOS]: 'Eletrônicos',
    [ItemCategoria.VESTUARIO]: 'Vestuário',
    [ItemCategoria.MOVEIS]: 'Móveis',
    [ItemCategoria.LIVROS]: 'Livros',
    [ItemCategoria.ESPORTES]: 'Esportes',
    [ItemCategoria.OUTROS]: 'Outros'
  };
  return labels[categoria] || 'Outros';
};

const getStatusLabel = (status: ItemStatus) => {
  const labels = {
    [ItemStatus.DISPONIVEL]: 'Disponível',
    [ItemStatus.TROCADO]: 'Trocado'
  };
  return labels[status] || 'Desconhecido';
};

const getStatusClass = (status: ItemStatus) => {
  return {
    [ItemStatus.DISPONIVEL]: 'available',
    [ItemStatus.TROCADO]: 'traded'
  }[status] || '';
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
});

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${apiBaseUrl.value}${imagePath}`;
};
</script>

<style scoped>
.item-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.item-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
}

.item-status.available {
  background-color: #2ecc71;
  color: white;
}

.item-status.traded {
  background-color: #e74c3c;
  color: white;
}

.item-image {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #bdc3c7;
}

.no-image i {
  font-size: 48px;
}

.item-content {
  padding: 15px;
  flex-grow: 1;
}

.item-title {
  font-size: 18px;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.item-category {
  margin-bottom: 10px;
}

.category-badge {
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.item-description {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.item-owner {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #7f8c8d;
}

.item-owner i {
  margin-right: 8px;
}

.item-footer {
  padding: 15px;
  border-top: 1px solid #eee;
}

.view-button {
  display: block;
  background-color: #3498db;
  color: white;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-button:hover {
  background-color: #2980b9;
}
</style>
