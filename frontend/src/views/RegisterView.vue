<template>
  <div class="auth-container">
    <div class="card" style="max-width: 500px; margin: 0 auto;">
      <h1 class="mb-3">Cadastro</h1>

      <div v-if="authStore.error" class="alert alert-error mb-3">
        {{ authStore.error }}
      </div>

      <div v-if="successMessage" class="alert alert-success mb-3">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" v-model="formData.nome" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="formData.email" required />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" v-model="formData.senha" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>

      <p class="mt-3 text-center">
        Já tem conta? <router-link to="/login">Faça login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  nome: '',
  email: '',
  senha: ''
})

const successMessage = ref('')

const handleRegister = async () => {
  const success = await authStore.register(formData.value)
  if (success) {
    successMessage.value = 'Cadastro realizado com sucesso! Redirecionando para login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
}
</script>

<style scoped>
.auth-container {
  padding: 2rem 0;
}
</style>
