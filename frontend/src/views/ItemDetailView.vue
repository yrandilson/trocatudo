<template>
  <div class="item-detail-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando detalhes do item...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>
      <button @click="fetchItem" class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="itemStore.currentItem" class="item-content">
      <div class="item-header">
        <h1 class="item-title">{{ itemStore.currentItem.titulo }}</h1>
        <div class="item-badges">
          <span class="category-badge">{{ itemStore.currentItem.category?.name }}</span>
          <span :class="['status-badge', getStatusClass(itemStore.currentItem.status)]">
            {{ getStatusLabel(itemStore.currentItem.status) }}
          </span>
        </div>
      </div>

      <div class="item-body">
        <div class="item-images">
          <ImageCarousel :images="itemStore.currentItem.imagens" />
        </div>

        <div class="item-info">
          <div class="item-description">
            <h2>Descrição</h2>
            <p>{{ itemStore.currentItem.descricao }}</p>
          </div>

          <div class="item-owner">
            <h2>Proprietário</h2>
            <div class="owner-info">
              <i class="fas fa-user"></i>
              <span>{{ itemStore.currentItem.user?.nome || 'Usuário' }}</span>
            </div>
          </div>

          <div class="item-dates">
            <p>
              <i class="fas fa-calendar-alt"></i>
              <span>Cadastrado em: {{ formatDate(itemStore.currentItem.createdAt) }}</span>
            </p>
            <p v-if="itemStore.currentItem.updatedAt !== itemStore.currentItem.createdAt">
              <i class="fas fa-edit"></i>
              <span>Atualizado em: {{ formatDate(itemStore.currentItem.updatedAt) }}</span>
            </p>
          </div>

          <div class="item-actions">
            <button 
              v-if="canPropose" 
              @click="showPropostaForm = true" 
              class="propose-button"
            >
              <i class="fas fa-handshake"></i> Fazer Proposta
            </button>
            
            <div v-else-if="!authStore.isAuthenticated" class="login-prompt">
              <p>Faça login para enviar uma proposta para este item</p>
              <router-link :to="{ name: 'Login', query: { redirect: route.fullPath } }" class="login-button">
                <i class="fas fa-sign-in-alt"></i> Entrar
              </router-link>
            </div>
            
            <div v-else-if="itemStore.currentItem.status === ItemStatus.TROCADO" class="traded-message">
              <i class="fas fa-info-circle"></i>
              <span>Este item já foi trocado e não está mais disponível</span>
            </div>

            <div v-if="isOwner || isModerator" class="owner-actions">
              <router-link 
                :to="{ name: 'EditItem', params: { id: itemStore.currentItem.id } }" 
                class="edit-button"
              >
                <i class="fas fa-edit"></i> Editar
              </router-link>
              <button @click="confirmDelete = true" class="delete-button">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isOwner && relatedPropostas.length > 0" class="related-propostas">
        <h2>Propostas Recebidas</h2>
        <div class="propostas-list">
          <div v-for="proposta in relatedPropostas" :key="proposta.id" class="proposta-card">
            <div class="proposta-header">
              <div class="proposta-status" :class="getPropostaStatusClass(proposta.status)">
                {{ getPropostaStatusLabel(proposta.status) }}
              </div>
              <div class="proposta-date">{{ formatDate(proposta.createdAt) }}</div>
            </div>
            <div class="proposta-body">
              <div class="proposta-user">
                <i class="fas fa-user"></i>
                <span>{{ proposta.proponente?.nome }}</span>
              </div>
              <div v-if="proposta.mensagem" class="proposta-message">
                <p>{{ proposta.mensagem }}</p>
              </div>
            </div>
            <div v-if="proposta.status === PropostaStatus.PENDENTE" class="proposta-actions">
              <button @click="updatePropostaStatus(proposta.id, PropostaStatus.ACEITA)" class="accept-button">
                <i class="fas fa-check"></i> Aceitar
              </button>
              <button @click="updatePropostaStatus(proposta.id, PropostaStatus.RECUSADA)" class="reject-button">
                <i class="fas fa-times"></i> Recusar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <i class="fas fa-search"></i>
      <p>Item não encontrado</p>
      <router-link to="/" class="back-button">Voltar para a página inicial</router-link>
    </div>

    <div v-if="showPropostaForm" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Fazer Proposta</h2>
          <button @click="showPropostaForm = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="mensagem">Mensagem (opcional):</label>
            <textarea 
              id="mensagem" 
              v-model="propostaForm.mensagem" 
              rows="4" 
              placeholder="Descreva sua proposta ou adicione informações para contato..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPropostaForm = false" class="cancel-button">Cancelar</button>
          <button @click="enviarProposta" :disabled="enviandoProposta" class="submit-button">
            <span v-if="enviandoProposta">
              <div class="spinner-small"></div> Enviando...
            </span>
            <span v-else>Enviar Proposta</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDelete" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button @click="confirmDelete = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja excluir este item?</p>
          <p class="warning">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal-footer">
          <button @click="confirmDelete = false" class="cancel-button">Cancelar</button>
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
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '@/stores/items';
import { useAuthStore } from '@/stores/auth';
import { usePropostasStore } from '@/stores/propostas';
import { ItemStatus, UserRole, PropostaStatus } from '@/types';
import ImageCarousel from '@/components/ImageCarousel.vue';

const route = useRoute();
const router = useRouter();
const itemStore = useItemsStore();
const authStore = useAuthStore();
const propostasStore = usePropostasStore();

const loading = ref(false);
const error = ref<string | null>(null);
const showPropostaForm = ref(false);
const enviandoProposta = ref(false);
const confirmDelete = ref(false);
const deletingItem = ref(false);

const propostaForm = ref({
  mensagem: ''
});

const isOwner = computed(() => {
  return authStore.user?.id === itemStore.currentItem?.userId;
});

const isModerator = computed(() => {
  return authStore.user?.role === UserRole.MODERATOR || authStore.user?.role === UserRole.ADMIN;
});

const canPropose = computed(() => {
  return (
    authStore.isAuthenticated && 
    !isOwner.value && 
    itemStore.currentItem?.status === ItemStatus.DISPONIVEL
  );
});

const relatedPropostas = computed(() => {
  if (!itemStore.currentItem) return [];
  
  return propostasStore.propostasRecebidas.filter(
    proposta => proposta.itemId === itemStore.currentItem?.id
  );
});

const fetchItem = async () => {
  const id = Number(route.params.id);
  if (isNaN(id)) {
    error.value = 'ID do item inválido';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await itemStore.fetchItemById(id);
    
    if (authStore.isAuthenticated && isOwner.value) {
      await propostasStore.fetchPropostasRecebidas();
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar o item';
  } finally {
    loading.value = false;
  }
};

const enviarProposta = async () => {
  if (!itemStore.currentItem) return;
  
  enviandoProposta.value = true;
  
  try {
    await propostasStore.createProposta(itemStore.currentItem.id, propostaForm.value.mensagem);
    
    showPropostaForm.value = false;
    propostaForm.value.mensagem = '';
    
    alert('Proposta enviada com sucesso!');
  } catch (err: any) {
    alert(err.message || 'Erro ao enviar proposta');
  } finally {
    enviandoProposta.value = false;
  }
};

const updatePropostaStatus = async (id: number, status: PropostaStatus) => {
  try {
    await propostasStore.updatePropostaStatus(id, status);
    
    if (status === PropostaStatus.ACEITA && itemStore.currentItem) {
      await itemStore.updateItem(itemStore.currentItem.id, {
        status: ItemStatus.TROCADO
      });
      await itemStore.fetchItemById(itemStore.currentItem.id);
    }
    
    await propostasStore.fetchPropostasRecebidas();
  } catch (err: any) {
    alert(err.message || 'Erro ao atualizar proposta');
  }
};

const deleteItem = async () => {
  if (!itemStore.currentItem) return;
  
  deletingItem.value = true;
  
  try {
    await itemStore.deleteItem(itemStore.currentItem.id);
    confirmDelete.value = false;
    router.push({ name: 'Home' });
  } catch (err: any) {
    alert(err.message || 'Erro ao excluir item');
    confirmDelete.value = false;
  } finally {
    deletingItem.value = false;
  }
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

const getPropostaStatusLabel = (status: PropostaStatus) => {
  const labels = {
    [PropostaStatus.PENDENTE]: 'Pendente',
    [PropostaStatus.ACEITA]: 'Aceita',
    [PropostaStatus.RECUSADA]: 'Recusada'
  };
  return labels[status] || 'Desconhecido';
};

const getPropostaStatusClass = (status: PropostaStatus) => {
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

onMounted(() => {
  fetchItem();
});
</script>

<style scoped>
/* Estilos permanecem os mesmos */
.item-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-container, .not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 300px;
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

.retry-button, .back-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.retry-button i {
  margin-right: 8px;
}

.item-header {
  margin-bottom: 20px;
}

.item-title {
  font-size: 28px;
  margin-bottom: 10px;
}

.item-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-badge, .status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.category-badge {
  background-color: #3498db;
}

.status-badge.available {
  background-color: #2ecc71;
}

.status-badge.traded {
  background-color: #e74c3c;
}

.item-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.item-description p {
    white-space: pre-wrap;
}

@media (max-width: 768px) {
  .item-body {
    grid-template-columns: 1fr;
  }
}
</style>