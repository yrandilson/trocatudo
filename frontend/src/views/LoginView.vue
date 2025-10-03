<template>
  <div class="auth-container">
    <div class="card" style="max-width: 500px; margin: 0 auto;">
      <h1 class="mb-3">Login</h1>

      <div v-if="authStore.error" class="alert alert-error mb-3">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="credentials.email" required />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" v-model="credentials.senha" required />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="mt-3 text-center">
        Não tem conta? <router-link to="/register">Cadastre-se</router-link>
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

const credentials = ref({
  email: '',
  senha: ''
})

const handleLogin = async () => {
  const success = await authStore.login(credentials.value)
  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.auth-container {
  padding: 2rem 0;
}
</style>
