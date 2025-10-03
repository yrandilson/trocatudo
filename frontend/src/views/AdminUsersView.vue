<template>
  <div class="admin-users-container">
    <div class="page-header">
      <h1>Administração de Usuários</h1>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar por nome ou email..." 
            @input="filterUsers"
          />
          <i class="fas fa-search"></i>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando usuários...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>
      <button @click="fetchUsers" class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
    </div>

    <div v-else>
      <div class="users-stats">
        <div class="stat-card">
          <div class="stat-value">{{ usersStore.users.length }}</div>
          <div class="stat-label">Total de Usuários</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ usersByRole.USER }}</div>
          <div class="stat-label">Usuários Comuns</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ usersByRole.MODERATOR }}</div>
          <div class="stat-label">Moderadores</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ usersByRole.ADMIN }}</div>
          <div class="stat-label">Administradores</div>
        </div>
      </div>

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhum usuário encontrado</p>
              </td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.nome }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', getRoleClass(user.role)]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editUser(user)" class="edit-button">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="confirmDelete(user)" 
                    class="delete-button"
                    :disabled="user.id === currentUserId"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edição de usuário -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Usuário</h2>
          <button @click="showEditModal = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" v-model="editForm.nome" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editForm.email" required />
          </div>
          <div class="form-group">
            <label for="role">Função</label>
            <select id="role" v-model="editForm.role" required>
              <option value="user">Usuário</option>
              <option value="moderator">Moderador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="cancel-button">Cancelar</button>
          <button @click="saveUser" :disabled="saving" class="save-button">
            <span v-if="saving">
              <div class="spinner-small"></div> Salvando...
            </span>
            <span v-else>Salvar</span>
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
          <p>Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.nome }}</strong>?</p>
          <p class="warning">Esta ação não pode ser desfeita e removerá todos os itens e propostas deste usuário.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-button">Cancelar</button>
          <button @click="deleteUser" :disabled="deleting" class="delete-button">
            <span v-if="deleting">
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
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { UserRole, type User } from '@/types';

const usersStore = useUsersStore();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const searchTerm = ref('');
const filteredUsers = ref<User[]>([]);

// Modais
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref<User | null>(null);
const saving = ref(false);
const deleting = ref(false);

// Formulário de edição
const editForm = ref({
  id: 0,
  nome: '',
  email: '',
  role: ''
});

const currentUserId = computed(() => {
  return authStore.user?.id || 0;
});

const usersByRole = computed(() => {
  const counts = {
    USER: 0,
    MODERATOR: 0,
    ADMIN: 0
  };
  
  usersStore.users.forEach(user => {
    if (user.role === UserRole.USER) counts.USER++;
    else if (user.role === UserRole.MODERATOR) counts.MODERATOR++;
    else if (user.role === UserRole.ADMIN) counts.ADMIN++;
  });
  
  return counts;
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    await usersStore.fetchUsers();
    filteredUsers.value = [...usersStore.users];
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar usuários';
  } finally {
    loading.value = false;
  }
};

const filterUsers = () => {
  if (!searchTerm.value.trim()) {
    filteredUsers.value = [...usersStore.users];
    return;
  }
  
  const term = searchTerm.value.toLowerCase();
  filteredUsers.value = usersStore.users.filter(user => 
    user.nome.toLowerCase().includes(term) || 
    user.email.toLowerCase().includes(term)
  );
};

const editUser = (user: User) => {
  editForm.value = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role
  };
  showEditModal.value = true;
};

const saveUser = async () => {
  saving.value = true;
  
  try {
    await usersStore.updateUser(editForm.value.id, {
      nome: editForm.value.nome,
      email: editForm.value.email,
      role: editForm.value.role as UserRole
    });
    
    showEditModal.value = false;
    
    // Recarregar a lista de usuários
    await fetchUsers();
  } catch (err: any) {
    alert(err.message || 'Erro ao salvar usuário');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (user: User) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await usersStore.deleteUser(userToDelete.value.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
    
    // Recarregar a lista de usuários
    await fetchUsers();
  } catch (err: any) {
    alert(err.message || 'Erro ao excluir usuário');
  } finally {
    deleting.value = false;
  }
};

const getRoleLabel = (role: UserRole) => {
  const labels = {
    [UserRole.USER]: 'Usuário',
    [UserRole.MODERATOR]: 'Moderador',
    [UserRole.ADMIN]: 'Administrador'
  };
  return labels[role] || 'Desconhecido';
};

const getRoleClass = (role: UserRole) => {
  return {
    [UserRole.USER]: 'user',
    [UserRole.MODERATOR]: 'moderator',
    [UserRole.ADMIN]: 'admin'
  }[role] || '';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-users-container {
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

.header-actions {
  display: flex;
  gap: 15px;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 16px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
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

.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  color: #7f8c8d;
}

.users-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #2c3e50;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover td {
  background-color: #f8f9fa;
}

.role-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.role-badge.user {
  background-color: #3498db;
  color: white;
}

.role-badge.moderator {
  background-color: #f39c12;
  color: white;
}

.role-badge.admin {
  background-color: #e74c3c;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button {
  color: #f39c12;
}

.delete-button {
  color: #e74c3c;
}

.edit-button:hover {
  background-color: rgba(243, 156, 18, 0.1);
}

.delete-button:hover:not(:disabled) {
  background-color: rgba(231, 76, 60, 0.1);
}

.delete-button:disabled {
  color: #bdc3c7;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 40px !important;
  color: #7f8c8d;
}

.no-results i {
  font-size: 32px;
  margin-bottom: 10px;
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
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
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

.save-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
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
  
  .search-box input {
    width: 100%;
  }
  
  .users-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
