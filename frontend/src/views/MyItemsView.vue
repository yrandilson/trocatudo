<template>
  <div class="my-items-container">
    <div class="page-header">
      <h1>Meus Itens</h1>
      <router-link to="/items/new" class="new-item-button">
        <i class="fas fa-plus"></i> Novo Item
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando seus itens...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>
      <button @click="fetchItems" class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="itemStore.myItems.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <h2>Você ainda não tem itens cadastrados</h2>
      <p>Cadastre itens que você não usa mais e troque por algo que precisa!</p>
      <router-link to="/items/new" class="add-item-button">
        <i class="fas fa-plus"></i> Cadastrar Meu Primeiro Item
      </router-link>
    </div>

    <div v-else class="items-grid">
      <div v-for="item in itemStore.myItems" :key="item.id" class="item-card">
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
        </div>
        
        <div class="item-actions">
          <router-link :to="`/items/${item.id}`" class="view-button">
            <i class="fas fa-eye"></i> Ver
          </router-link>
          <router-link :to="`/items/${item.id}/edit`" class="edit-button">
            <i class="fas fa-edit"></i> Editar
          </router-link>
          <button @click="confirmDelete(item)" class="delete-button">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button @click="showDeleteModal = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja excluir o item <strong>{{ itemToDelete?.titulo }}</strong>?</p>
          <p class="warning">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-button">Cancelar</button>
          <button @click="deleteItem" :disabled="deletingItem" class="delete-button">
            <span v-if="deletingItem">
              <div class="spinner-small"></div> Excluindo...
            </span>
            <span v-else>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useItemsStore } from '@/stores/items';
import { ItemCategoria, ItemStatus, type Item } from '@/types';

const itemStore = useItemsStore();
const loading = ref(false);
const error = ref<string | null>(null);
const showDeleteModal = ref(false);
const itemToDelete = ref<Item | null>(null);
const deletingItem = ref(false);

const fetchItems = async () => {
  loading.value = true;
  error.value = null;

  try {
    await itemStore.fetchMyItems();
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar seus itens';
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (item: Item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;
  
  deletingItem.value = true;
  
  try {
    await itemStore.deleteItem(itemToDelete.value.id);
    showDeleteModal.value = false;
    itemToDelete.value = null;
    
    // Recarregar a lista após excluir
    await itemStore.fetchMyItems();
  } catch (err: any) {
    alert(err.message || 'Erro ao excluir item');
  } finally {
    deletingItem.value = false;
  }
};

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

onMounted(() => {
  fetchItems();
});
</script>

<style scoped>
.my-items-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
}

.new-item-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-small {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.error-message {
  display: flex;
  align-items: center;
  color: #e74c3c;
  margin-bottom: 20px;
}

.error-message i {
  font-size: 24px;
  margin-right: 10px;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.retry-button i {
  margin-right: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 64px;
  color: #95a5a6;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 30px;
  max-width: 500px;
}

.add-item-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
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
  margin: 0;
  line-height: 1.5;
}

.item-actions {
  display: flex;
  border-top: 1px solid #eee;
}

.view-button,
.edit-button,
.delete-button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
  text-decoration: none;
  color: #2c3e50;
  transition: background-color 0.2s;
}

.view-button {
  color: #3498db;
}

.edit-button {
  color: #f39c12;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.delete-button {
  color: #e74c3c;
}

.view-button:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.edit-button:hover {
  background-color: rgba(243, 156, 18, 0.1);
}

.delete-button:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
