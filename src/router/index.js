import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'FormularioActual',
    component: () => import('@/views/public/FormularioActual.vue')
  },

  {
    path: '/form/:uuid',
    name: 'PublicForm',
    component: () => import('@/views/public/PublicFormView.vue'),
    meta: { requiresAuth: false }
  },
  
  // ══════════════════════════════════════════
  // AUTH ROUTES
  // ══════════════════════════════════════════
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  
  // ══════════════════════════════════════════
  // ADMIN ROUTES (protegidas)
  // ══════════════════════════════════════════
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue')
      },
      {
        path: 'forms',
        name: 'AdminForms',
        component: () => import('@/views/admin/forms/FormsListView.vue')
      },
      {
        path: 'forms/create',
        name: 'AdminFormCreate',
        component: () => import('@/views/admin/forms/FormCreateView.vue')
      },
      {
        path: 'forms/:uuid/edit',
        name: 'AdminFormEdit',
        component: () => import('@/views/admin/forms/FormEditView.vue')
      },
      {
        path: 'forms/:id',
        name: 'AdminFormDetail',
        component: () => import('@/views/admin/forms/FormDetailView.vue')
      },
      {
        path: 'forms/:id/responses',
        name: 'AdminFormResponses',
        component: () => import('@/views/admin/forms/FormResponsesView.vue')
      },
      // Respuestas generales (todas las respuestas)
      {
        path: 'responses',
        name: 'AdminResponses',
        component: () => import('@/views/admin/responses/ResponsesListView.vue')
      },
      // Plantillas
      {
        path: 'templates',
        name: 'AdminTemplates',
        component: () => import('@/views/admin/templates/TemplatesListView.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/UsersListView.vue')
      },
      // Cursos - ARREGLADO
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('@/views/admin/courses/CoursesListView.vue')
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/admin/ProfileView.vue')
      },
      // Reportes de formularios
      {
        path: 'forms/:id/reports',
        name: 'AdminFormReports',
        component: () => import('@/views/admin/forms/FormReportsView.vue')
      },
      // Configuración
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SettingsView.vue')
      }
    ]
  },
  
  // Catch all route - 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  },

  //ruta de linkedin
  {
    path: '/linkedin/callback',
    name: 'LinkedInCallback',
    component: () => import('@/views/LinkedInCallbackView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ══════════════════════════════════════════
// NAVIGATION GUARD
// ══════════════════════════════════════════
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar autenticación desde localStorage
  const isAuthenticated = authStore.isAuthenticated || authStore.checkAuth()
  
  // Ruta requiere autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    return
  }
  
  // Ruta solo para invitados (login) - si ya está autenticado, ir al dashboard
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'AdminDashboard' })
    return
  }
  
  next()
})

export default router