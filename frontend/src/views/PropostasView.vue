<template>
  <div class="propostas-container">
    <div class="page-header">
      <h1>Minhas Propostas</h1>
    </div>

    <div class="tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'received' }]" 
        @click="activeTab = 'received'"
      >
        <i class="fas fa-inbox"></i> Recebidas
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'sent' }]" 
        @click="activeTab = 'sent'"
      >
        <i class="fas fa-paper-plane"></i> Enviadas
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando propostas...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>
      <button @click="fetchPropostas" class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
    </div>

    <div v-else>
      <!-- Propostas Recebidas -->
      <div v-if="activeTab === 'received'">
        <div v-if="propostasStore.receivedPropostas.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h2>Nenhuma proposta recebida</h2>
          <p>Quando alguém fizer uma proposta para seus itens, ela aparecerá aqui.</p>
        </div>

        <div v-else class="propostas-list">
          <div 
            v-for="proposta in propostasStore.receivedPropostas" 
            :key="proposta.id" 
            class="proposta-card"
          >
            <div class="proposta-header">
              <div class="proposta-status" :class="getStatusClass(proposta.status)">
                {{ getStatusLabel(proposta.status) }}
              </div>
              <div class="proposta-date">
                {{ formatDate(proposta.createdAt) }}
              </div>
            </div>

            <div class="proposta-body">
              <div class="proposta-item">
                <h3>Item solicitado:</h3>
                <div class="item-info">
                  <div class="item-image">
                    <img 
                      v-if="proposta.item?.imagens && proposta.item.imagens.length > 0" 
                      :src="getImageUrl(proposta.item.imagens[0])" 
                      alt="Item" 
                    />
                    <div v-else class="no-image">
                      <i class="fas fa-image"></i>
                    </div>
                  </div>
                  <div class="item-details">
                    <h4>{{ proposta.item?.titulo }}</h4>
                    <span class="category-badge">{{ getCategoriaLabel(proposta.item?.categoria) }}</span>
                  </div>
                </div>
              </div>

              <div class="proposta-user">
                <h3>Proposta de:</h3>
                <div class="user-info">
                  <i class="fas fa-user"></i>
                  <span>{{ proposta.proponente?.nome }}</span>
                </div>
              </div>

              <div v-if="proposta.mensagem" class="proposta-message">
                <h3>Mensagem:</h3>
                <p>{{ proposta.mensagem }}</p>
              </div>
            </div>

            <div class="proposta-actions">
              <router-link :to="`/items/${proposta.itemId}`" class="view-item-button">
                <i class="fas fa-eye"></i> Ver Item
              </router-link>
              
              <div v-if="proposta.status === 'pendente'" class="decision-buttons">
                <button @click="updateStatus(proposta.id, 'aceita')" class="accept-button">
                  <i class="fas fa-check"></i> Aceitar
                </button>
                <button @click="updateStatus(proposta.id, 'recusada')" class="reject-button">
                  <i class="fas fa-times"></i> Recusar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Propostas Enviadas -->
      <div v-if="activeTab === 'sent'">
        <div v-if="propostasStore.sentPropostas.length === 0" class="empty-state">
          <i class="fas fa-paper-plane"></i>
          <h2>Nenhuma proposta enviada</h2>
          <p>Quando você fizer propostas para itens, elas aparecerão aqui.</p>
          <router-link to="/" class="browse-button">
            <i class="fas fa-search"></i> Procurar Itens
          </router-link>
        </div>

        <div v-else class="propostas-list">
          <div 
            v-for="proposta in propostasStore.sentPropostas" 
            :key="proposta.id" 
            class="proposta-card"
          >
            <div class="proposta-header">
              <div class="proposta-status" :class="getStatusClass(proposta.status)">
                {{ getStatusLabel(proposta.status) }}
              </div>
              <div class="proposta-date">
                {{ formatDate(proposta.createdAt) }}
              </div>
            </div>

            <div class="proposta-body">
              <div class="proposta-item">
                <h3>Item solicitado:</h3>
                <div class="item-info">
                  <div class="item-image">
                    <img 
                      v-if="proposta.item?.imagens && proposta.item.imagens.length > 0" 
                      :src="getImageUrl(proposta.item.imagens[0])" 
                      alt="Item" 
                    />
                    <div v-else class="no-image">
                      <i class="fas fa-image"></i>
                    </div>
                  </div>
                  <div class="item-details">
                    <h4>{{ proposta.item?.titulo }}</h4>
                    <span class="category-badge">{{ getCategoriaLabel(proposta.item?.categoria) }}</span>
                  </div>
                </div>
              </div>

              <div class="proposta-user">
                <h3>Proprietário:</h3>
                <div class="user-info">
                  <i class="fas fa-user"></i>
                  <span>{{ proposta.item?.user?.nome }}</span>
                </div>
              </div>

              <div v-if="proposta.mensagem" class="proposta-message">
                <h3>Sua mensagem:</h3>
                <p>{{ proposta.mensagem }}</p>
              </div>
            </div>

            <div class="proposta-actions">
              <router-link :to="`/items/${proposta.itemId}`" class="view-item-button">
                <i class="fas fa-eye"></i> Ver Item
              </router-link>
              
              <button 
                v-if="proposta.status === 'pendente'" 
                @click="cancelProposta(proposta.id)" 
                class="cancel-button"
              >
                <i class="fas fa-ban"></i> Cancelar Proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ confirmModalTitle }}</h2>
          <button @click="showConfirmModal = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ confirmModalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="cancel-button">Cancelar</button>
          <button @click="confirmAction" :disabled="processing" :class="confirmButtonClass">
            <span v-if="processing">
              <div class="spinner-small"></div> Processando...
            </span>
            <span v-else>{{ confirmButtonText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePropostasStore } from '@/stores/propostas';
import { ItemCategoria, PropostaStatus } from '@/types';

const propostasStore = usePropostasStore();
const activeTab = ref('received');
const loading = ref(false);
const error = ref<string | null>(null);
const processing = ref(false);

// Modal de confirmação
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const confirmButtonText = ref('');
const confirmButtonClass = ref('');
const pendingAction = ref<(() => Promise<void>) | null>(null);

const fetchPropostas = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (activeTab.value === 'received') {
      await propostasStore.fetchReceivedPropostas();
    } else {
      await propostasStore.fetchSentPropostas();
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar propostas';
  } finally {
    loading.value = false;
  }
};

const updateStatus = (id: number, status: string) => {
  if (status === 'aceita') {
    confirmModalTitle.value = 'Aceitar Proposta';
    confirmModalMessage.value = 'Ao aceitar esta proposta, todas as outras propostas para este item serão automaticamente recusadas. Deseja continuar?';
    confirmButtonText.value = 'Aceitar';
    confirmButtonClass.value = 'accept-button';
  } else {
    confirmModalTitle.value = 'Recusar Proposta';
    confirmModalMessage.value = 'Tem certeza que deseja recusar esta proposta?';
    confirmButtonText.value = 'Recusar';
    confirmButtonClass.value = 'reject-button';
  }

  pendingAction.value = async () => {
    processing.value = true;
    try {
      await propostasStore.updatePropostaStatus(id, status as PropostaStatus);
      await propostasStore.fetchReceivedPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar proposta');
    } finally {
      processing.value = false;
      showConfirmModal.value = false;
    }
  };

  showConfirmModal.value = true;
};

const cancelProposta = (id: number) => {
  confirmModalTitle.value = 'Cancelar Proposta';
  confirmModalMessage.value = 'Tem certeza que deseja cancelar esta proposta?';
  confirmButtonText.value = 'Cancelar Proposta';
  confirmButtonClass.value = 'cancel-button';

  pendingAction.value = async () => {
    processing.value = true;
    try {
      await propostasStore.deleteProposta(id);
      await propostasStore.fetchSentPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar proposta');
    } finally {
      processing.value = false;
      showConfirmModal.value = false;
    }
  };

  showConfirmModal.value = true;
};

const confirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value();
  }
};

const getStatusLabel = (status: PropostaStatus) => {
  const labels = {
    [PropostaStatus.PENDENTE]: 'Pendente',
    [PropostaStatus.ACEITA]: 'Aceita',
    [PropostaStatus.RECUSADA]: 'Recusada'
  };
  return labels[status] || 'Desconhecido';
};

const getStatusClass = (status: PropostaStatus) => {
  return {
    [PropostaStatus.PENDENTE]: 'pending',
    [PropostaStatus.ACEITA]: 'accepted',
    [PropostaStatus.RECUSADA]: 'rejected'
  }[status] || '';
};

const getCategoriaLabel = (categoria?: ItemCategoria) => {
  if (!categoria) return 'Outros';
  
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
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

watch(activeTab, () => {
  fetchPropostas();
});

onMounted(() => {
  fetchPropostas();
});
</script>

<style scoped>
.propostas-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
}

.tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-button:hover:not(.active) {
  color: #2c3e50;
  background-color: #f8f9fa;
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

.browse-button {
  background-color: #3498db;
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

.propostas-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.proposta-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.proposta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.proposta-status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.proposta-status.pending {
  background-color: #f39c12;
  color: white;
}

.proposta-status.accepted {
  background-color: #2ecc71;
  color: white;
}

.proposta-status.rejected {
  background-color: #e74c3c;
  color: white;
}

.proposta-date {
  font-size: 14px;
  color: #7f8c8d;
}

.proposta-body {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.proposta-item h3,
.proposta-user h3,
.proposta-message h3 {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #7f8c8d;
}

.item-info {
  display: flex;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 24px;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 18px;
  margin: 0 0 10px 0;
}

.category-badge {
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info i {
  color: #7f8c8d;
}

.proposta-message p {
  margin: 0;
  white-space: pre-line;
}

.proposta-actions {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-item-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.decision-buttons {
  display: flex;
  gap: 10px;
}

.accept-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reject-button,
.cancel-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
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

@media (max-width: 768px) {
  .proposta-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .view-item-button,
  .decision-buttons {
    width: 100%;
  }
  
  .decision-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  
  .accept-button,
  .reject-button,
  .cancel-button {
    justify-content: center;
  }
}
</style>
