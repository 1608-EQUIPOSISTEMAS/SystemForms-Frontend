import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'FormularioActual',
    component: () => import('@/views/public/FormularioActual.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router