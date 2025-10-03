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
      <div v-if="activeTab === 'received'">
        <div v-if="propostasStore.propostasRecebidas.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h2>Nenhuma proposta recebida</h2>
          <p>Quando alguém fizer uma proposta para seus itens, ela aparecerá aqui.</p>
        </div>

        <div v-else class="propostas-list">
          <div 
            v-for="proposta in propostasStore.propostasRecebidas" 
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
                    <span class="category-badge">{{ proposta.item?.category?.name }}</span>
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

      <div v-if="activeTab === 'sent'">
        <div v-if="propostasStore.propostasEnviadas.length === 0" class="empty-state">
          <i class="fas fa-paper-plane"></i>
          <h2>Nenhuma proposta enviada</h2>
          <p>Quando você fizer propostas para itens, elas aparecerão aqui.</p>
          <router-link to="/" class="browse-button">
            <i class="fas fa-search"></i> Procurar Itens
          </router-link>
        </div>

        <div v-else class="propostas-list">
          <div 
            v-for="proposta in propostasStore.propostasEnviadas" 
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
                    <span class="category-badge">{{ proposta.item?.category?.name }}</span>
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
import { ref, onMounted, watch } from 'vue';
import { usePropostasStore } from '@/stores/propostas';
import { PropostaStatus } from '@/types';

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
      await propostasStore.fetchPropostasRecebidas();
    } else {
      await propostasStore.fetchPropostasEnviadas();
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
      await propostasStore.fetchPropostasRecebidas();
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
      await propostasStore.fetchPropostasEnviadas();
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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  return imagePath;
};

watch(activeTab, () => {
  fetchPropostas();
});

onMounted(() => {
  fetchPropostas();
});
</script>

<style scoped>
/* Estilos permanecem os mesmos */
</style>