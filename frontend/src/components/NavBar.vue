<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="logo">
          <i class="fas fa-exchange-alt"></i>
          <span>TrocaTudo</span>
        </router-link>
      </div>
      
      <div class="navbar-menu" :class="{ active: menuOpen }">
        <!-- Links públicos -->
        <div class="navbar-start">
          <router-link to="/" class="navbar-item" active-class="active">
            <i class="fas fa-home"></i> Início
          </router-link>
        </div>
        
        <!-- Links autenticados -->
        <div class="navbar-end">
          <template v-if="authStore.isAuthenticated">
            <router-link to="/my-items" class="navbar-item" active-class="active">
              <i class="fas fa-box"></i> Meus Itens
            </router-link>
            <router-link to="/propostas" class="navbar-item" active-class="active">
              <i class="fas fa-handshake"></i> Propostas
              <span v-if="pendingPropostas > 0" class="notification-badge">{{ pendingPropostas }}</span>
            </router-link>
            
            <!-- Links de admin -->
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin/users" 
              class="navbar-item" 
              active-class="active"
            >
              <i class="fas fa-users-cog"></i> Admin
            </router-link>
            
            <div class="navbar-item has-dropdown" :class="{ 'is-active': userDropdownOpen }">
              <a @click.prevent="toggleUserDropdown" class="navbar-link">
                <i class="fas fa-user-circle"></i>
                <span>{{ authStore.user?.nome }}</span>
                <i class="fas fa-chevron-down"></i>
              </a>
              
              <div class="navbar-dropdown">
                <a @click="logout" class="dropdown-item">
                  <i class="fas fa-sign-out-alt"></i> Sair
                </a>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/login" class="navbar-item" active-class="active">
              <i class="fas fa-sign-in-alt"></i> Entrar
            </router-link>
            <router-link to="/register" class="navbar-item register-button">
              <i class="fas fa-user-plus"></i> Cadastrar
            </router-link>
          </template>
        </div>
      </div>
      
      <div class="navbar-burger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePropostasStore } from '@/stores/propostas';
import { useRouter } from 'vue-router';
import { PropostaStatus } from '@/types';

const authStore = useAuthStore();
const propostasStore = usePropostasStore();
const router = useRouter();

const menuOpen = ref(false);
const userDropdownOpen = ref(false);

const pendingPropostas = computed(() => {
  if (!authStore.isAuthenticated) return 0;
  
  return propostasStore.receivedPropostas.filter(
    proposta => proposta.status === PropostaStatus.PENDENTE
  ).length;
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    userDropdownOpen.value = false;
  }
};

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value;
};

const closeDropdowns = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.has-dropdown')) {
    userDropdownOpen.value = false;
  }
  if (!target.closest('.navbar-burger') && !target.closest('.navbar-menu')) {
    menuOpen.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Carregar propostas pendentes quando o usuário estiver autenticado
onMounted(async () => {
  document.addEventListener('click', closeDropdowns);
  
  if (authStore.isAuthenticated) {
    try {
      await propostasStore.fetchReceivedPropostas();
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
  text-decoration: none;
}

.logo i {
  margin-right: 10px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 20px;
}

.navbar-start,
.navbar-end {
  display: flex;
  align-items: center;
}

.navbar-item {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 70px;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  position: relative;
}

.navbar-item i {
  margin-right: 8px;
}

.navbar-item:hover {
  color: #3498db;
}

.navbar-item.active {
  color: #3498db;
  box-shadow: inset 0 -3px 0 #3498db;
}

.register-button {
  background-color: #3498db;
  color: white !important;
  border-radius: 4px;
  margin-left: 10px;
  height: 40px;
}

.register-button:hover {
  background-color: #2980b9;
}

.notification-badge {
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  position: absolute;
  top: 15px;
  right: 5px;
}

.has-dropdown {
  position: relative;
}

.navbar-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-link i.fa-chevron-down {
  margin-left: 8px;
  font-size: 12px;
  transition: transform 0.2s;
}

.has-dropdown.is-active .fa-chevron-down {
  transform: rotate(180deg);
}

.navbar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  display: none;
  z-index: 20;
}

.has-dropdown.is-active .navbar-dropdown {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #2c3e50;
  text-decoration: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #3498db;
}

.dropdown-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.navbar-burger {
  display: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  position: relative;
}

.navbar-burger span {
  display: block;
  position: absolute;
  height: 2px;
  width: 30px;
  background-color: #2c3e50;
  left: 5px;
  transition: all 0.3s;
}

.navbar-burger span:nth-child(1) {
  top: 10px;
}

.navbar-burger span:nth-child(2) {
  top: 20px;
}

.navbar-burger span:nth-child(3) {
  top: 30px;
}

@media (max-width: 768px) {
  .navbar-burger {
    display: block;
  }
  
  .navbar-menu {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background-color: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    display: none;
  }
  
  .navbar-menu.active {
    display: flex;
  }
  
  .navbar-start,
  .navbar-end {
    flex-direction: column;
    width: 100%;
  }
  
  .navbar-item {
    width: 100%;
    padding: 15px 20px;
    height: auto;
    border-bottom: 1px solid #eee;
  }
  
  .navbar-item.active {
    box-shadow: inset 4px 0 0 #3498db;
  }
  
  .register-button {
    margin: 10px 20px;
    height: auto;
    padding: 10px;
    text-align: center;
    justify-content: center;
  }
  
  .has-dropdown {
    width: 100%;
  }
  
  .navbar-dropdown {
    position: static;
    box-shadow: none;
    width: 100%;
    padding-left: 20px;
  }
  
  .notification-badge {
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
