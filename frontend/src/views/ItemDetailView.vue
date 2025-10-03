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
          <span class="category-badge">{{ getCategoriaLabel(itemStore.currentItem.categoria) }}</span>
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
            <!-- Botão de proposta para usuários autenticados que não são donos do item -->
            <button 
              v-if="canPropose" 
              @click="showPropostaForm = true" 
              class="propose-button"
            >
              <i class="fas fa-handshake"></i> Fazer Proposta
            </button>
            
            <!-- Mensagem para usuários não autenticados -->
            <div v-else-if="!authStore.isAuthenticated" class="login-prompt">
              <p>Faça login para enviar uma proposta para este item</p>
              <router-link to="/login" class="login-button">
                <i class="fas fa-sign-in-alt"></i> Entrar
              </router-link>
            </div>
            
            <!-- Mensagem para itens já trocados -->
            <div v-else-if="itemStore.currentItem.status === ItemStatus.TROCADO" class="traded-message">
              <i class="fas fa-info-circle"></i>
              <span>Este item já foi trocado e não está mais disponível</span>
            </div>

            <!-- Ações para o dono do item ou moderadores -->
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
      
      <!-- Seção de propostas relacionadas para o dono do item -->
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

    <!-- Modal de proposta -->
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

    <!-- Modal de confirmação de exclusão -->
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
import { ItemCategoria, ItemStatus, UserRole, PropostaStatus } from '@/types';
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
    
    // Se o usuário for o dono do item, carregar as propostas relacionadas
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
    
    // Mostrar mensagem de sucesso
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
    
    // Se aceitar a proposta, atualizar o status do item para trocado
    if (status === PropostaStatus.ACEITA && itemStore.currentItem) {
      await itemStore.updateItem(itemStore.currentItem.id, {
        status: ItemStatus.TROCADO
      });
      
      // Recarregar o item para atualizar o status
      await itemStore.fetchItemById(itemStore.currentItem.id);
    }
    
    // Recarregar as propostas
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
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

onMounted(() => {
  fetchItem();
});
</script>

<style scoped>
.item-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
}

.category-badge {
  background-color: #3498db;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status-badge.available {
  background-color: #2ecc71;
  color: white;
}

.status-badge.traded {
  background-color: #e74c3c;
  color: white;
}

.item-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .item-body {
    grid-template-columns: 1fr;
  }
}

.item-images {
  width: 100%;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.item-description h2,
.item-owner h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.item-description p {
  line-height: 1.6;
  white-space: pre-line;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-dates {
  margin-top: 10px;
  font-size: 14px;
  color: #7f8c8d;
}

.item-dates p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.item-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.propose-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-prompt {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.login-button {
  display: inline-flex;
  align-items: center;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  margin-top: 10px;
  text-decoration: none;
  gap: 8px;
}

.traded-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  color: #7f8c8d;
}

.owner-actions {
  display: flex;
  gap: 10px;
}

.edit-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.not-found i {
  font-size: 48px;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.back-button {
  margin-top: 20px;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}

/* Seção de propostas relacionadas */
.related-propostas {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.related-propostas h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.propostas-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.proposta-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.proposta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.proposta-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
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
  font-size: 12px;
  color: #7f8c8d;
}

.proposta-body {
  padding: 15px;
}

.proposta-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.proposta-message {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.proposta-message p {
  margin: 0;
  white-space: pre-line;
}

.proposta-actions {
  display: flex;
  border-top: 1px solid #eee;
}

.accept-button,
.reject-button {
  flex: 1;
  border: none;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}

.accept-button {
  background-color: #2ecc71;
  color: white;
}

.reject-button {
  background-color: #e74c3c;
  color: white;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
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

.submit-button {
  background-color: #2ecc71;
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
</style>
