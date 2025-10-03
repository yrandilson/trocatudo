<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Troque o que você não usa mais por algo que precisa!</h1>
        <p>
          TrocaTudo é uma plataforma gratuita para trocas de itens.
          Cadastre seus itens, faça propostas e economize!
        </p>
        <div class="hero-buttons">
          <router-link to="/items/new" class="primary-button" v-if="authStore.isAuthenticated">
            <i class="fas fa-plus"></i> Cadastrar Item
          </router-link>
          <router-link to="/register" class="primary-button" v-else>
            <i class="fas fa-user-plus"></i> Cadastre-se Grátis
          </router-link>
          <a href="#items" class="secondary-button">
            <i class="fas fa-search"></i> Ver Itens
          </a>
        </div>
      </div>
    </section>

    <section id="items" class="items-section">
      <div class="section-header">
        <h2>Itens Disponíveis</h2>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar itens..." 
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
      </div>

      <div class="items-container">
        <aside class="filters-sidebar">
          <ItemFilter 
            :initialCategories="selectedCategories"
            :initialStatus="selectedStatus"
            :initialSort="sortBy"
            @filter="handleFilter"
          />
        </aside>

        <div class="items-content">
          <div v-if="itemsStore.loading" class="loading">
            <div class="spinner"></div>
            <p>Carregando itens...</p>
          </div>

          <div v-else-if="itemsStore.error" class="error-container">
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>{{ itemsStore.error }}</p>
            </div>
            <button @click="fetchItems" class="retry-button">
              <i class="fas fa-sync-alt"></i> Tentar novamente
            </button>
          </div>

          <div v-else-if="itemsStore.items.length === 0" class="no-items">
            <i class="fas fa-search"></i>
            <h3>Nenhum item encontrado</h3>
            <p>Tente ajustar seus filtros ou buscar por outro termo.</p>
          </div>

          <div v-else class="items-grid">
            <ItemCard 
              v-for="item in itemsStore.items" 
              :key="item.id" 
              :item="item" 
            />
          </div>

          <div v-if="itemsStore.pagination.totalPages > 1" class="pagination">
            <button 
              @click="changePage(itemsStore.pagination.page - 1)" 
              :disabled="itemsStore.pagination.page === 1" 
              class="pagination-button"
            >
              <i class="fas fa-chevron-left"></i> Anterior
            </button>
            
            <div class="pagination-info">
              Página {{ itemsStore.pagination.page }} de {{ itemsStore.pagination.totalPages }}
            </div>
            
            <button 
              @click="changePage(itemsStore.pagination.page + 1)" 
              :disabled="itemsStore.pagination.page === itemsStore.pagination.totalPages" 
              class="pagination-button"
            >
              Próxima <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <h2>Como Funciona</h2>
      <div class="steps">
        <div class="step">
          <div class="step-icon">
            <i class="fas fa-box-open"></i>
          </div>
          <h3>Cadastre seus itens</h3>
          <p>Adicione fotos e descrições dos itens que você não usa mais.</p>
        </div>
        <div class="step">
          <div class="step-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Encontre o que precisa</h3>
          <p>Busque entre milhares de itens disponíveis para troca.</p>
        </div>
        <div class="step">
          <div class="step-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <h3>Faça uma proposta</h3>
          <p>Envie uma proposta para o dono do item que você deseja.</p>
        </div>
        <div class="step">
          <div class="step-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <h3>Realize a troca</h3>
          <p>Combine com o outro usuário e realize a troca pessoalmente.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useItemsStore } from '@/stores/items';
import { useAuthStore } from '@/stores/auth';
import { ItemStatus } from '@/types';
import ItemFilter from '@/components/ItemFilter.vue';
import ItemCard from '@/components/ItemCard.vue';
import { useRoute, useRouter } from 'vue-router';

const itemsStore = useItemsStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchTerm = ref('');
const selectedCategories = ref<string[]>([]);
const selectedStatus = ref<string[]>([ItemStatus.DISPONIVEL]);
const sortBy = ref('newest');

const fetchItems = () => {
  const categoriaParam = selectedCategories.value.length > 0 
    ? selectedCategories.value.join(',') 
    : undefined;
  
  const statusParam = selectedStatus.value.length > 0 
    ? selectedStatus.value.join(',') 
    : undefined;
  
  itemsStore.fetchItems(1, categoriaParam, statusParam);
};

const handleSearch = () => {
  // Implementar busca por termo quando a API suportar
  fetchItems();
};

const handleFilter = (filters: { categories: string[], status: string[], sort: string }) => {
  selectedCategories.value = filters.categories;
  selectedStatus.value = filters.status;
  sortBy.value = filters.sort;
  
  updateQueryParams();
  fetchItems();
};

const changePage = (page: number) => {
  itemsStore.fetchItems(page, 
    selectedCategories.value.length > 0 ? selectedCategories.value.join(',') : undefined, 
    selectedStatus.value.length > 0 ? selectedStatus.value.join(',') : undefined
  );
  
  // Scroll para o topo da seção de itens
  const itemsSection = document.getElementById('items');
  if (itemsSection) {
    itemsSection.scrollIntoView({ behavior: 'smooth' });
  }
};

const updateQueryParams = () => {
  router.push({
    query: {
      categorias: selectedCategories.value.length > 0 ? selectedCategories.value.join(',') : undefined,
      status: selectedStatus.value.length > 0 ? selectedStatus.value.join(',') : undefined,
      sort: sortBy.value !== 'newest' ? sortBy.value : undefined
    }
  });
};

// Carregar parâmetros da URL
const loadQueryParams = () => {
  const query = route.query;
  
  if (query.categorias) {
    selectedCategories.value = (query.categorias as string).split(',');
  }
  
  if (query.status) {
    selectedStatus.value = (query.status as string).split(',');
  }
  
  if (query.sort) {
    sortBy.value = query.sort as string;
  }
};

watch(route, () => {
  loadQueryParams();
  fetchItems();
}, { immediate: false });

onMounted(() => {
  loadQueryParams();
  itemsStore.fetchItems();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 36px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.hero-content p {
  font-size: 18px;
  margin-bottom: 30px;
  color: #7f8c8d;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.primary-button {
  background-color: #3498db;
  color: white;
}

.primary-button:hover {
  background-color: #2980b9;
}

.secondary-button {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.secondary-button:hover {
  background-color: #bdc3c7;
}

.primary-button i,
.secondary-button i {
  margin-right: 8px;
}

/* Items Section */
.items-section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  margin: 0;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.items-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.filters-sidebar {
  position: sticky;
  top: 90px;
  height: fit-content;
}

.items-content {
  min-height: 400px;
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

.no-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-items i {
  font-size: 48px;
  color: #95a5a6;
  margin-bottom: 20px;
}

.no-items h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.no-items p {
  color: #7f8c8d;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.pagination-button {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.pagination-button:disabled {
  background-color: #f8f9fa;
  color: #bdc3c7;
  cursor: not-allowed;
}

.pagination-button i {
  margin-right: 8px;
}

.pagination-button i:last-child {
  margin-right: 0;
  margin-left: 8px;
}

.pagination-info {
  font-size: 14px;
  color: #7f8c8d;
}

/* How It Works Section */
.how-it-works {
  padding: 60px 0;
  text-align: center;
}

.how-it-works h2 {
  font-size: 28px;
  margin-bottom: 40px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.step {
  padding: 20px;
}

.step-icon {
  width: 80px;
  height: 80px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.step-icon i {
  font-size: 32px;
}

.step h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.step p {
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 28px;
  }
  
  .hero-content p {
    font-size: 16px;
  }
  
  .hero-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .items-container {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    position: static;
  }
}
</style>
