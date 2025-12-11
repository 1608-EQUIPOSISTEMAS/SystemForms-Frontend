<template>
  <div class="responses-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Respuestas</h1>
        <p>Gestión de todas las respuestas recibidas</p>
      </div>
      <div class="header-actions">
        <button class="btn-refresh" @click="loadData" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          Actualizar
        </button>
        <button class="btn-export" @click="exportAll" :disabled="!responses.length">
          <i class="bi bi-download"></i>
          Exportar Todo
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total"><i class="bi bi-inbox-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total Respuestas</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon exams"><i class="bi bi-mortarboard-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.exams }}</span>
          <span class="stat-label">Exámenes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon surveys"><i class="bi bi-clipboard-data-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.surveys }}</span>
          <span class="stat-label">Encuestas</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending"><i class="bi bi-hourglass-split"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">En Progreso</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group search-group">
        <label>Buscar</label>
        <div class="search-input">
          <i class="bi bi-search"></i>
          <input 
            v-model="filters.search" 
            type="search" 
            placeholder="Buscar por email, nombre o formulario..."
            @input="debouncedFilter"
          >
        </div>
      </div>
      
      <div class="filter-group">
        <label>Formulario</label>
        <select v-model="filters.formId" @change="applyFilters">
          <option value="">Todos los formularios</option>
          <option 
            v-for="form in forms" 
            :key="form.id" 
            :value="form.id"
          >
            {{ form.title }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Tipo</label>
        <select v-model="filters.formType" @change="applyFilters">
          <option value="">Todos</option>
          <option value="EXAM">Exámenes</option>
          <option value="SURVEY">Encuestas</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">Todos</option>
          <option value="SUBMITTED">Completadas</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="GRADED">Calificadas</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Fecha</label>
        <select v-model="filters.dateRange" @change="applyFilters">
          <option value="">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Cargando respuestas...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredResponses.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="bi bi-inbox"></i>
      </div>
      <h2>No hay respuestas</h2>
      <p v-if="hasActiveFilters">No se encontraron respuestas con los filtros aplicados</p>
      <p v-else>Las respuestas a tus formularios aparecerán aquí</p>
      <button v-if="hasActiveFilters" class="btn-clear-filters" @click="clearFilters">
        Limpiar filtros
      </button>
    </div>

    <!-- Table -->
    <div v-else class="responses-table">
      <table>
        <thead>
          <tr>
            <th class="col-id">#</th>
            <th class="col-form">Formulario</th>
            <th class="col-type">Tipo</th>
            <th class="col-respondent">Respondiente</th>
            <th class="col-date">Fecha</th>
            <th class="col-score">Puntuación</th>
            <th class="col-status">Estado</th>
            <th class="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="response in paginatedResponses" :key="response.id">
            <td class="col-id">
              <span class="id-badge">{{ response.id }}</span>
            </td>
            <td class="col-form">
              <div class="form-info">
                <span class="form-title">{{ response.form_title }}</span>
              </div>
            </td>
            <td class="col-type">
              <span class="type-badge" :class="response.form_type?.toLowerCase()">
                <i :class="response.form_type === 'EXAM' ? 'bi bi-mortarboard' : 'bi bi-clipboard-data'"></i>
                {{ response.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
              </span>
            </td>
            <td class="col-respondent">
              <div class="respondent-info">
                <span class="respondent-name">
                  {{ getRespondentName(response) }}
                </span>
                <span class="respondent-email" v-if="getRespondentEmail(response)">
                  {{ getRespondentEmail(response) }}
                </span>
              </div>
            </td>
            <td class="col-date">
              <div class="date-info">
                <span class="date-main">{{ formatDate(response.submitted_at || response.started_at) }}</span>
                <span class="date-time">{{ formatTime(response.submitted_at || response.started_at) }}</span>
              </div>
            </td>
            <td class="col-score">
              <template v-if="response.form_type === 'EXAM' && response.percentage_score !== null">
                <div class="score-display" :class="getScoreClass(response)">
                  <span class="score-value">{{ Math.round(response.percentage_score) }}%</span>
                  <span class="score-status">
                    <i :class="response.passed ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                  </span>
                </div>
              </template>
              <span v-else class="no-score">—</span>
            </td>
            <td class="col-status">
              <span class="status-badge" :class="response.status?.toLowerCase()">
                {{ getStatusLabel(response.status) }}
              </span>
            </td>
            <td class="col-actions">
              <div class="actions-group">
                <router-link 
                  :to="`/admin/forms/${response.form_uuid}/responses#response-${response.id}`"
                  class="btn-icon"
                  title="Ver detalle"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
                <button 
                  class="btn-icon danger"
                  @click="confirmDelete(response)"
                  title="Eliminar"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination-bar" v-if="totalPages > 1">
        <div class="pagination-info">
          Mostrando {{ paginationStart }}-{{ paginationEnd }} de {{ filteredResponses.length }} respuestas
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            <i class="bi bi-chevron-double-left"></i>
          </button>
          <button 
            class="btn-page" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="page-indicator">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button 
            class="btn-page" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
          <button 
            class="btn-page" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Eliminar Respuesta</h3>
          <button class="btn-close" @click="showDeleteModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar esta respuesta?</p>
          <div class="delete-info">
            <strong>{{ responseToDelete?.form_title }}</strong>
            <span>{{ getRespondentName(responseToDelete) }}</span>
          </div>
          <p class="warning-text">
            <i class="bi bi-exclamation-triangle"></i>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-delete" @click="deleteResponse" :disabled="deleting">
            <span v-if="deleting">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import responseService from '@/services/response.service'
import formService from '@/services/form.service'

const router = useRouter()

// State
const loading = ref(false)
const responses = ref([])
const forms = ref([])
const currentPage = ref(1)
const itemsPerPage = 15

// Delete modal
const showDeleteModal = ref(false)
const responseToDelete = ref(null)
const deleting = ref(false)

// Filters
const filters = ref({
  search: '',
  formId: '',
  formType: '',
  status: '',
  dateRange: ''
})

// Debounce timer
let debounceTimer = null

// Stats
const stats = computed(() => {
  return {
    total: responses.value.length,
    exams: responses.value.filter(r => r.form_type === 'EXAM').length,
    surveys: responses.value.filter(r => r.form_type === 'SURVEY').length,
    pending: responses.value.filter(r => r.status === 'IN_PROGRESS').length
  }
})

// Filtered responses
const filteredResponses = computed(() => {
  let result = [...responses.value]
  
  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(r => {
      const name = getRespondentName(r).toLowerCase()
      const email = getRespondentEmail(r)?.toLowerCase() || ''
      const title = r.form_title?.toLowerCase() || ''
      return name.includes(search) || email.includes(search) || title.includes(search)
    })
  }
  
  // Form filter
  if (filters.value.formId) {
    result = result.filter(r => r.form_id === parseInt(filters.value.formId))
  }
  
  // Type filter
  if (filters.value.formType) {
    result = result.filter(r => r.form_type === filters.value.formType)
  }
  
  // Status filter
  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }
  
  // Date filter
  if (filters.value.dateRange) {
    const now = new Date()
    let startDate = null
    
    switch (filters.value.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }
    
    if (startDate) {
      result = result.filter(r => {
        const responseDate = new Date(r.submitted_at || r.started_at)
        return responseDate >= startDate
      })
    }
  }
  
  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredResponses.value.length / itemsPerPage))

const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredResponses.value.slice(start, start + itemsPerPage)
})

const paginationStart = computed(() => {
  return filteredResponses.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredResponses.value.length)
})

const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.formId || 
         filters.value.formType || filters.value.status || filters.value.dateRange
})

// Watch for filter changes to reset page
watch([filters], () => {
  currentPage.value = 1
}, { deep: true })

// Methods
async function loadData() {
  loading.value = true
  try {
    // Load all responses
    const responseData = await responseService.list({ limit: 1000 })
    if (responseData?.data?.ok && responseData.data.data?.responses) {
      responses.value = responseData.data.data.responses
    } else if (responseData?.data?.responses) {
      responses.value = responseData.data.responses
    } else {
      responses.value = []
    }
    
    // Load forms for filter
    const formData = await formService.list({ limit: 100 })
    if (formData?.ok && formData.data?.forms) {
      forms.value = formData.data.forms
    } else if (formData?.forms) {
      forms.value = formData.forms
    } else {
      forms.value = []
    }
  } catch (error) {
    console.error('Error loading data:', error)
    responses.value = []
    forms.value = []
  } finally {
    loading.value = false
  }
}

function debouncedFilter() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

function applyFilters() {
  currentPage.value = 1
}

function clearFilters() {
  filters.value = {
    search: '',
    formId: '',
    formType: '',
    status: '',
    dateRange: ''
  }
}

function getRespondentName(response) {
  if (!response) return 'Anónimo'
  
  // Check Odoo student names first
  if (response.odoo_student_names || response.odoo_student_surnames) {
    const names = response.odoo_student_names || ''
    const surnames = response.odoo_student_surnames || ''
    return `${names} ${surnames}`.trim() || 'Anónimo'
  }
  
  // Check user info
  if (response.user_name) return response.user_name
  if (response.first_name || response.last_name) {
    return `${response.first_name || ''} ${response.last_name || ''}`.trim()
  }
  
  // Check respondent_name field
  if (response.respondent_name) return response.respondent_name
  
  return 'Anónimo'
}

function getRespondentEmail(response) {
  if (!response) return null
  return response.respondent_email || response.user_email || response.email || null
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusLabel(status) {
  const labels = {
    'IN_PROGRESS': 'En Progreso',
    'SUBMITTED': 'Completada',
    'GRADED': 'Calificada'
  }
  return labels[status] || status
}

function getScoreClass(response) {
  if (response.passed) return 'passed'
  return 'failed'
}

function confirmDelete(response) {
  responseToDelete.value = response
  showDeleteModal.value = true
}

async function deleteResponse() {
  if (!responseToDelete.value) return
  
  deleting.value = true
  try {
    await responseService.delete(responseToDelete.value.id)
    responses.value = responses.value.filter(r => r.id !== responseToDelete.value.id)
    showDeleteModal.value = false
    responseToDelete.value = null
  } catch (error) {
    console.error('Error deleting response:', error)
    alert('Error al eliminar la respuesta')
  } finally {
    deleting.value = false
  }
}

async function exportAll() {
  // Generate CSV from current filtered data
  const data = filteredResponses.value
  
  const headers = ['ID', 'Formulario', 'Tipo', 'Respondiente', 'Email', 'Fecha', 'Puntuación', 'Aprobado', 'Estado']
  
  const rows = data.map(r => [
    r.id,
    `"${r.form_title?.replace(/"/g, '""') || ''}"`,
    r.form_type === 'EXAM' ? 'Examen' : 'Encuesta',
    `"${getRespondentName(r).replace(/"/g, '""')}"`,
    getRespondentEmail(r) || '',
    formatDate(r.submitted_at || r.started_at),
    r.percentage_score !== null ? `${Math.round(r.percentage_score)}%` : '',
    r.form_type === 'EXAM' ? (r.passed ? 'Sí' : 'No') : '',
    getStatusLabel(r.status)
  ])
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `respuestas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.responses-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.actions-cell { display: flex; justify-content: flex-end; gap: 6px; }
.btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-light); border-radius: 6px; color: var(--text-light); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-icon:hover { background: var(--gray); color: var(--text); }
.btn-icon.danger:hover { background: #fee2e2; color: var(--danger); }
.th-actions { text-align: right; width: 80px; }


/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  margin: 0 0 4px 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.header-content p {
  margin: 0;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-refresh,
.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-refresh {
  background: #f3f4f6;
  color: #374151;
}

.btn-refresh:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-export {
  background: #001845;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background: #002d6e;
}

.btn-refresh:disabled,
.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.25rem;
}

.stat-icon.total { background: #ede9fe; color: #7c3aed; }
.stat-icon.exams { background: #dbeafe; color: #2563eb; }
.stat-icon.surveys { background: #d1fae5; color: #059669; }
.stat-icon.pending { background: #fef3c7; color: #d97706; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Filters */
.filters-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-input {
  position: relative;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 38px;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  background: white;
  transition: all 0.15s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.1);
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 2rem;
  color: #9ca3af;
}

.empty-state h2 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #111827;
}

.empty-state p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.btn-clear-filters {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
}

.btn-clear-filters:hover {
  background: #e5e7eb;
}

/* Table */
.responses-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f9fafb;
}

/* Column widths */
.col-id { width: 60px; }
.col-form { min-width: 180px; }
.col-type { width: 120px; }
.col-respondent { min-width: 180px; }
.col-date { width: 130px; }
.col-score { width: 100px; }
.col-status { width: 120px; }
.col-actions { width: 100px; }

.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.form-info {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-weight: 500;
  color: #111827;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge.exam {
  background: #dbeafe;
  color: #1d4ed8;
}

.type-badge.survey {
  background: #d1fae5;
  color: #047857;
}

.respondent-info {
  display: flex;
  flex-direction: column;
}

.respondent-name {
  font-weight: 500;
  color: #111827;
}

.respondent-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-main {
  font-weight: 500;
  color: #111827;
}

.date-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.score-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.score-display.passed {
  background: #d1fae5;
  color: #047857;
}

.score-display.failed {
  background: #fee2e2;
  color: #dc2626;
}

.score-value {
  font-size: 0.875rem;
}

.score-status i {
  font-size: 0.875rem;
}

.no-score {
  color: #9ca3af;
}

.status-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.submitted {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.in_progress {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.graded {
  background: #dbeafe;
  color: #1e40af;
}

.actions-group {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-action.view {
  background: #ede9fe;
  color: #7c3aed;
}

.btn-action.view:hover {
  background: #ddd6fe;
}

.btn-action.delete {
  background: #fee2e2;
  color: #dc2626;
}

.btn-action.delete:hover {
  background: #fecaca;
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-page {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  padding: 0 12px;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #111827;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.btn-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #374151;
}

.delete-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.delete-info strong {
  color: #111827;
}

.delete-info span {
  font-size: 0.875rem;
  color: #6b7280;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
}

.btn-cancel,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-delete {
  background: #dc2626;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1200px) {
  .filters-bar {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .search-group {
    grid-column: span 3;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-bar {
    grid-template-columns: 1fr;
  }
  
  .search-group {
    grid-column: span 1;
  }
  
  .responses-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 900px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-refresh,
  .btn-export {
    flex: 1;
    justify-content: center;
  }
}
</style>