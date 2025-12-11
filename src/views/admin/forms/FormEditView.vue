<template>
  <div class="form-editor">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
      <p>Cargando formulario...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle"></i>
      <h2>Error al cargar</h2>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="router.push('/admin/forms')">
        Volver a formularios
      </button>
    </div>

    <!-- Editor -->
    <template v-else>
      <!-- Header -->
      <header class="editor-header">
        <div class="header-left">
          <button class="btn-back" @click="handleBack">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="form-meta">
            <div class="form-badges">
              <span class="badge" :class="store.form.form_type?.toLowerCase()">
                <i :class="store.form.form_type === 'EXAM' ? 'bi bi-mortarboard' : 'bi bi-clipboard-data'"></i>
                {{ store.form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
              </span>
              <span class="badge status" :class="{ active: store.form.settings?.is_active }">
                {{ store.form.settings?.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <input
              type="text"
              class="title-input"
              placeholder="Título del formulario"
              v-model="store.form.title"
              @input="markDirty"
            />
          </div>
        </div>

        <div class="header-actions">
          <button class="btn-icon" @click="showSettings = true" title="Configuración">
            <i class="bi bi-gear"></i>
          </button>
          <button class="btn-icon" @click="showPreview = true" title="Vista previa">
            <i class="bi bi-eye"></i>
          </button>
          <button 
            class="btn-save" 
            @click="handleSave"
            :disabled="!canSave || saving"
          >
            <i v-if="saving" class="bi bi-arrow-repeat spinning"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="editor-body">
        <!-- Sidebar - Question Types -->
        <aside class="editor-sidebar">
          <div class="sidebar-section">
            <h3>Agregar Pregunta</h3>
            <div class="question-types">
              <button 
                v-for="type in store.questionTypes" 
                :key="type.id"
                class="type-btn"
                @click="addQuestion(type.id)"
                :title="type.description"
              >
                <i :class="getTypeIcon(type.code)"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <div class="sidebar-section" v-if="store.form.form_type === 'EXAM'">
            <h3>Curso Asociado</h3>
            <select v-model="store.form.course_id" class="course-select" @change="markDirty">
              <option :value="null">Sin curso</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="sidebar-section">
            <h3>Resumen</h3>
            <div class="summary-stats">
              <div class="stat">
                <span class="stat-value">{{ store.questions?.length || 0 }}</span>
                <span class="stat-label">Preguntas</span>
              </div>
              <div class="stat" v-if="store.form.form_type === 'EXAM'">
                <span class="stat-value">{{ totalPoints }}</span>
                <span class="stat-label">Puntos</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main - Questions List -->
        <main class="editor-main">
          <!-- Description -->
          <div class="form-description-card">
            <label>Descripción del formulario</label>
            <textarea
              v-model="store.form.description"
              placeholder="Añade una descripción para los participantes..."
              rows="3"
              @input="markDirty"
            ></textarea>
          </div>

          <!-- Empty State -->
          <div v-if="!store.questions || store.questions.length === 0" class="empty-questions">
            <i class="bi bi-plus-circle"></i>
            <h3>Sin preguntas</h3>
            <p>Selecciona un tipo de pregunta del panel izquierdo para comenzar</p>
          </div>

          <!-- Questions List -->
          <div v-else class="questions-list">
            <QuestionEditor
              v-for="(question, index) in store.questions"
              :key="question.temp_id || question.id || index"
              :question="question"
              :index="index"
              :total="store.questions.length"
              :is-exam="store.form.form_type === 'EXAM'"
              @update="(data) => updateQuestion(question.temp_id || question.id, data)"
              @remove="() => removeQuestion(question.temp_id || question.id)"
              @move-up="() => moveQuestion(index, index - 1)"
              @move-down="() => moveQuestion(index, index + 1)"
              @duplicate="() => duplicateQuestion(question.temp_id || question.id)"
            />
          </div>
        </main>
      </div>
    </template>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="modal-content settings-modal">
          <div class="modal-header">
            <h2>Configuración del Formulario</h2>
            <button class="btn-close" @click="showSettings = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="settings-tabs">
              <button 
                :class="{ active: settingsTab === 'general' }"
                @click="settingsTab = 'general'"
              >General</button>
              <button 
                :class="{ active: settingsTab === 'access' }"
                @click="settingsTab = 'access'"
              >Acceso</button>
              <button 
                v-if="store.form.form_type === 'EXAM'"
                :class="{ active: settingsTab === 'exam' }"
                @click="settingsTab = 'exam'"
              >Examen</button>
              <button 
                :class="{ active: settingsTab === 'messages' }"
                @click="settingsTab = 'messages'"
              >Mensajes</button>
            </div>

            <!-- General Tab -->
            <div v-show="settingsTab === 'general'" class="settings-content">
              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.is_active" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Formulario activo</span>
                </label>
                <p class="setting-help">Cuando está desactivado, nadie puede responder</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.show_progress_bar" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Mostrar barra de progreso</span>
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.shuffle_questions" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Mezclar preguntas</span>
                </label>
              </div>
            </div>

            <!-- Access Tab -->
            <div v-show="settingsTab === 'access'" class="settings-content">
              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.requires_login" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Requiere inicio de sesión</span>
                </label>
              </div>

              <div class="setting-group" v-if="store.form.form_type === 'SURVEY'">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.is_public" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Formulario público</span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-group">
                  <label>Disponible desde</label>
                  <input 
                    type="datetime-local" 
                    v-model="store.form.settings.available_from"
                    @change="markDirty"
                  >
                </div>
                <div class="setting-group">
                  <label>Disponible hasta</label>
                  <input 
                    type="datetime-local" 
                    v-model="store.form.settings.available_until"
                    @change="markDirty"
                  >
                </div>
              </div>
            </div>

            <!-- Exam Tab -->
            <div v-show="settingsTab === 'exam'" class="settings-content">
              <div class="setting-group">
                <label>Tiempo límite (minutos)</label>
                <input 
                  type="number" 
                  v-model.number="store.form.settings.time_limit_minutes"
                  min="1"
                  placeholder="Sin límite"
                  @change="markDirty"
                >
              </div>

              <div class="setting-group">
                <label>Puntaje mínimo para aprobar (%)</label>
                <input 
                  type="number" 
                  v-model.number="store.form.settings.passing_score"
                  min="0"
                  max="100"
                  placeholder="70"
                  @change="markDirty"
                >
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.show_score_after_submit" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Mostrar puntaje al finalizar</span>
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" v-model="store.form.settings.show_correct_answers" @change="markDirty">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Mostrar respuestas correctas</span>
                </label>
              </div>
            </div>

            <!-- Messages Tab -->
            <div v-show="settingsTab === 'messages'" class="settings-content">
              <div class="setting-group">
                <label>Mensaje de bienvenida</label>
                <textarea 
                  v-model="store.form.settings.welcome_message"
                  rows="3"
                  placeholder="Se muestra antes de comenzar..."
                  @input="markDirty"
                ></textarea>
              </div>

              <div class="setting-group">
                <label>Mensaje al enviar</label>
                <textarea 
                  v-model="store.form.settings.submit_message"
                  rows="3"
                  placeholder="Gracias por completar el formulario."
                  @input="markDirty"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showSettings = false">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
        <div class="modal-content preview-modal">
          <div class="modal-header">
            <h2>Vista Previa</h2>
            <button class="btn-close" @click="showPreview = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body preview-body">
            <div class="preview-container">
              <div class="preview-form">
                <h1>{{ store.form.title || 'Sin título' }}</h1>
                <p v-if="store.form.description">{{ store.form.description }}</p>
                
                <div 
                  v-for="(q, i) in store.questions" 
                  :key="q.temp_id || q.id"
                  class="preview-question"
                >
                  <div class="question-header">
                    <span class="question-number">{{ i + 1 }}</span>
                    <span class="question-text">{{ q.question_text || 'Pregunta sin texto' }}</span>
                    <span v-if="q.is_required" class="required-mark">*</span>
                  </div>
                  
                  <div class="question-preview-input">
                    <template v-if="['TEXT', 'EMAIL'].includes(q.type_code)">
                      <input type="text" :placeholder="q.placeholder || 'Tu respuesta'" disabled>
                    </template>
                    <template v-else-if="q.type_code === 'TEXTAREA'">
                      <textarea :placeholder="q.placeholder || 'Tu respuesta'" disabled></textarea>
                    </template>
                    <template v-else-if="q.type_code === 'RADIO'">
                      <div v-for="opt in q.options" :key="opt.temp_id || opt.id" class="radio-option">
                        <input type="radio" disabled>
                        <span>{{ opt.option_text }}</span>
                      </div>
                    </template>
                    <template v-else-if="q.type_code === 'CHECKBOX'">
                      <div v-for="opt in q.options" :key="opt.temp_id || opt.id" class="checkbox-option">
                        <input type="checkbox" disabled>
                        <span>{{ opt.option_text }}</span>
                      </div>
                    </template>
                    <template v-else-if="q.type_code === 'SELECT'">
                      <select disabled>
                        <option>Seleccionar...</option>
                        <option v-for="opt in q.options" :key="opt.temp_id || opt.id">{{ opt.option_text }}</option>
                      </select>
                    </template>
                    <template v-else>
                      <input type="text" placeholder="Respuesta" disabled>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Unsaved Changes Modal -->
    <Teleport to="body">
      <div v-if="showUnsavedModal" class="modal-overlay">
        <div class="modal-content unsaved-modal">
          <div class="modal-header">
            <h2>Cambios sin guardar</h2>
          </div>
          <div class="modal-body">
            <p>Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="discardAndLeave">Descartar</button>
            <button class="btn-primary" @click="saveAndLeave">Guardar y salir</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <i :class="toast.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useFormBuilderStore } from '@/stores/formBuilder'
import QuestionEditor from '@/components/forms/QuestionEditor.vue'
import { courseService } from '@/services/course.service'

const route = useRoute()
const router = useRouter()
const store = useFormBuilderStore()

// State
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const isDirty = ref(false)
const courses = ref([])

// Modals
const showSettings = ref(false)
const showPreview = ref(false)
const showUnsavedModal = ref(false)
const settingsTab = ref('general')

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Pending navigation
let pendingNavigation = null

// Computed
const canSave = computed(() => {
  return store.form?.title?.trim() && store.questions?.length > 0
})

const totalPoints = computed(() => {
  if (!store.questions) return 0
  return store.questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0)
})

// Methods
function markDirty() {
  isDirty.value = true
}

function getTypeIcon(code) {
  const icons = {
    TEXT: 'bi bi-fonts',
    TEXTAREA: 'bi bi-text-paragraph',
    SELECT: 'bi bi-chevron-down',
    RADIO: 'bi bi-circle',
    CHECKBOX: 'bi bi-check-square',
    NUMBER: 'bi bi-123',
    EMAIL: 'bi bi-envelope',
    DATE: 'bi bi-calendar',
    TIME: 'bi bi-clock',
    DATETIME: 'bi bi-calendar-event',
    FILE: 'bi bi-paperclip',
    RATING: 'bi bi-star',
    SCALE: 'bi bi-sliders'
  }
  return icons[code] || 'bi bi-question-circle'
}

function addQuestion(typeId) {
  store.addQuestion(typeId)
  markDirty()
}

function updateQuestion(id, data) {
  store.updateQuestion(id, data)
  markDirty()
}

function removeQuestion(id) {
  store.removeQuestion(id)
  markDirty()
}

function moveQuestion(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= store.questions.length) return
  store.moveQuestion(fromIndex, toIndex)
  markDirty()
}

function duplicateQuestion(id) {
  store.duplicateQuestion(id)
  markDirty()
}

async function handleSave() {
  const uuid = route.params.uuid
  if (!canSave.value || !uuid) return
  
  saving.value = true
  try {
    await store.updateForm(uuid)
    isDirty.value = false
    showToast('Formulario guardado correctamente', 'success')
  } catch (err) {
    console.error('Error saving:', err)
    showToast('Error al guardar el formulario', 'error')
  } finally {
    saving.value = false
  }
}

function handleBack() {
  if (isDirty.value) {
    showUnsavedModal.value = true
    pendingNavigation = () => router.push('/admin/forms')
  } else {
    router.push('/admin/forms')
  }
}

async function saveAndLeave() {
  await handleSave()
  showUnsavedModal.value = false
  if (pendingNavigation) {
    pendingNavigation()
    pendingNavigation = null
  }
}

function discardAndLeave() {
  isDirty.value = false
  showUnsavedModal.value = false
  if (pendingNavigation) {
    pendingNavigation()
    pendingNavigation = null
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    showUnsavedModal.value = true
    pendingNavigation = () => next()
    next(false)
  } else {
    next()
  }
})

// Load form data
async function loadFormData() {
  const uuid = route.params.uuid
  
  console.log('Loading form with UUID:', uuid) // Debug
  
  if (!uuid) {
    error.value = 'UUID del formulario no encontrado'
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Load question types first
    await store.loadQuestionTypes()
    console.log('Question types loaded:', store.questionTypes.length) // Debug
    
    // Load courses (optional, don't fail if it errors)
    try {
      const courseResponse = await courseService.list()
      courses.value = courseResponse.data?.courses || []
    } catch (e) {
      console.warn('Could not load courses:', e)
    }
    
    // Load form
    console.log('Loading form...') // Debug
    const success = await store.loadForm(uuid)
    console.log('Form load result:', success) // Debug
    
    if (!success) {
      error.value = 'No se pudo cargar el formulario'
    }
  } catch (err) {
    console.error('Error loading form:', err)
    error.value = err.message || 'Error al cargar el formulario'
  } finally {
    loading.value = false
  }
}

// Initialize - usar watch con immediate para capturar el UUID cuando esté disponible
watch(
  () => route.params.uuid,
  async (newUuid) => {
    console.log('UUID detected:', newUuid)
    if (newUuid) {
      await loadFormData()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.form-editor {
  min-height: 100vh;
  background: #f8fafc;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  text-align: center;
}

.error-state i {
  font-size: 3rem;
  color: #dc2626;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.btn-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
}

.btn-back:hover {
  background: #e5e7eb;
}

.form-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.exam { background: #dbeafe; color: #1d4ed8; }
.badge.survey { background: #d1fae5; color: #047857; }
.badge.status { background: #fee2e2; color: #dc2626; }
.badge.status.active { background: #d1fae5; color: #047857; }

.title-input {
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  background: transparent;
  outline: none;
  width: 100%;
}

.title-input::placeholder {
  color: #9ca3af;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
}

.btn-icon:hover {
  background: #f9fafb;
  color: #111827;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #001845;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover:not(:disabled) {
  background: #002d6e;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #001845;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.spinning {
  animation: spin 1s linear infinite;
}

.editor-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.sidebar-section h3 {
  margin: 0 0 16px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.question-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
}

.type-btn:hover {
  background: #f3f4f6;
  border-color: #001845;
  color: #001845;
}

.type-btn i {
  width: 20px;
  color: #6b7280;
}

.course-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #001845;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-description-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.form-description-card label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-description-card textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.empty-questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  text-align: center;
}

.empty-questions i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-questions h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-questions p {
  margin: 0;
  color: #6b7280;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-modal { max-width: 600px; }
.preview-modal { max-width: 800px; }
.unsaved-modal { max-width: 400px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
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

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Settings tabs */
.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 8px;
}

.settings-tabs button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
}

.settings-tabs button.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group > label:not(.setting-toggle) {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.setting-group input[type="text"],
.setting-group input[type="number"],
.setting-group input[type="datetime-local"],
.setting-group textarea {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.setting-toggle input { display: none; }

.toggle-slider {
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  position: relative;
  transition: 0.2s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: 0.2s;
}

.setting-toggle input:checked + .toggle-slider {
  background: #001845;
}

.setting-toggle input:checked + .toggle-slider::after {
  left: 22px;
}

.toggle-label {
  font-weight: 500;
  color: #374151;
}

.setting-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.setting-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Preview */
.preview-body {
  background: #f3f4f6;
}

.preview-container {
  max-width: 600px;
  margin: 0 auto;
}

.preview-form {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.preview-form h1 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.preview-form > p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.preview-question {
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.question-number {
  background: #001845;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.question-text {
  font-weight: 500;
  color: #111827;
}

.required-mark {
  color: #dc2626;
}

.question-preview-input input,
.question-preview-input textarea,
.question-preview-input select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #111827;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  z-index: 2000;
}

.toast.success { background: #059669; }
.toast.error { background: #dc2626; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 1024px) {
  .editor-body {
    grid-template-columns: 1fr;
  }
  
  .question-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .question-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .setting-row {
    grid-template-columns: 1fr;
  }
}
</style>