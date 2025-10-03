import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { public: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true }
    },
    {
      path: '/items/:id',
      name: 'ItemDetail',
      component: () => import('@/views/ItemDetailView.vue'),
      meta: { public: true }
    },
    {
      path: '/my-items',
      name: 'MyItems',
      component: () => import('@/views/MyItemsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/items/new',
      name: 'NewItem',
      component: () => import('@/views/ItemFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/items/:id/edit',
      name: 'EditItem',
      component: () => import('@/views/ItemFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/propostas',
      name: 'Propostas',
      component: () => import('@/views/PropostasView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('@/views/AdminUsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Tentar carregar usuário se tiver token
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  // Verificar autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Verificar permissão de admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
