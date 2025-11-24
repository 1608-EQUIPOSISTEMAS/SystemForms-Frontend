import './assets/styles/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import restrict from '@/directives/restrict.js'
import router from './router'     
import pinia from './store'        

// Bootstrap CSS + JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap'

import { createCatalogService } from '@/services/catalog.service.js'
import { createServices, ServiceKeys } from '@/services'

async function bootstrap() {
  const app = createApp(App)

  // Router y Pinia 
  app.use(router)
  app.use(pinia)

  // Catálogo
  const catalog = createCatalogService()
  try {
    await catalog.ensureLoaded()
  } catch (e) {
    console.warn('No se pudieron precargar catálogos desde API, uso cache local si existe.', e)
  }
  app.provide('catalog', catalog)

  // Servicios únicos (DI)
  const services = createServices()
  app.provide(ServiceKeys.Program, services[ServiceKeys.Program])
  app.provide(ServiceKeys.Comercial, services[ServiceKeys.Comercial])
  
  // Directiva
  app.directive('restrict', restrict)

  // Montar
  app.mount('#app')
}

bootstrap()