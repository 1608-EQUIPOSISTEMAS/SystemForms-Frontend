<template>
  <div class="question-editor" :class="{ expanded: isExpanded, 'has-error': hasError }">
    <!-- Header -->
    <div class="question-header" @click="toggleExpand">
      <div class="header-left">
        <div class="drag-handle" @click.stop>
          <i class="bi bi-grip-vertical"></i>
        </div>
        <span class="question-number">{{ index + 1 }}</span>
        <span class="question-type">
          <i :class="typeIcon"></i>
          {{ question.type_name }}
        </span>
        <span class="question-preview" v-if="!isExpanded">
          {{ question.question_text || 'Sin texto' }}
        </span>
      </div>
      <div class="header-right">
        <span v-if="question.is_required" class="required-badge">Requerido</span>
        <span v-if="isExam && question.points" class="points-badge">{{ question.points }} pts</span>
        <button class="btn-expand">
          <i :class="isExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-show="isExpanded" class="question-content">
      <!-- Question Text -->
      <div class="form-group">
        <label>Pregunta <span class="required">*</span></label>
        <textarea
          v-model="localQuestion.question_text"
          placeholder="Escribe tu pregunta aquí..."
          rows="2"
          @input="handleUpdate"
        ></textarea>
      </div>

      <!-- Help Text -->
      <div class="form-group">
        <label>Texto de ayuda <span class="optional">(opcional)</span></label>
        <input
          type="text"
          v-model="localQuestion.help_text"
          placeholder="Información adicional para el usuario"
          @input="handleUpdate"
        >
      </div>

      <!-- Options for SELECT, RADIO, CHECKBOX -->
      <div v-if="question.has_options" class="options-section">
        <label>Opciones</label>
        <div class="options-list">
          <TransitionGroup name="option-list" tag="div">
            <div 
              v-for="(option, optIndex) in localQuestion.options" 
              :key="option.temp_id || option.id"
              class="option-item"
            >
              <div class="option-drag">
                <i class="bi bi-grip-vertical"></i>
              </div>
              
              <!-- Correct indicator for exams -->
              <button 
                v-if="isExam"
                class="correct-toggle"
                :class="{ active: option.is_correct }"
                @click="toggleCorrect(optIndex)"
                :title="option.is_correct ? 'Respuesta correcta' : 'Marcar como correcta'"
              >
                <i :class="question.type_code === 'CHECKBOX' ? 'bi bi-check-square' : 'bi bi-check-circle'"></i>
              </button>
              
              <input
                type="text"
                v-model="option.option_text"
                placeholder="Texto de la opción"
                @input="handleUpdate"
              >
              
              <!-- Points for this option (only for exams) -->
              <input
                v-if="isExam && option.is_correct"
                type="number"
                v-model.number="option.points"
                class="option-points"
                placeholder="Pts"
                min="0"
                @input="handleUpdate"
              >
              
              <button 
                class="btn-remove-option"
                @click="removeOption(optIndex)"
                :disabled="localQuestion.options.length <= 2"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </TransitionGroup>
        </div>
        
        <button class="btn-add-option" @click="addOption">
          <i class="bi bi-plus"></i>
          Agregar opción
        </button>
      </div>

      <!-- Placeholder for TEXT types -->
      <div v-if="['TEXT', 'TEXTAREA', 'EMAIL', 'NUMBER'].includes(question.type_code)" class="form-group">
        <label>Placeholder <span class="optional">(opcional)</span></label>
        <input
          type="text"
          v-model="localQuestion.placeholder"
          placeholder="Texto de ejemplo"
          @input="handleUpdate"
        >
      </div>

      <!-- Settings Row -->
      <div class="settings-row">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="localQuestion.is_required"
            @change="handleUpdate"
          >
          <span>Obligatoria</span>
        </label>

        <div v-if="isExam" class="points-input">
          <label>Puntos:</label>
          <input 
            type="number" 
            v-model.number="localQuestion.points"
            min="0"
            @input="handleUpdate"
          >
        </div>
      </div>

      <!-- Actions -->
      <div class="question-actions">
        <div class="actions-left">
          <button 
            class="btn-action"
            @click="$emit('move-up')"
            :disabled="index === 0"
            title="Mover arriba"
          >
            <i class="bi bi-arrow-up"></i>
          </button>
          <button 
            class="btn-action"
            @click="$emit('move-down')"
            :disabled="index === total - 1"
            title="Mover abajo"
          >
            <i class="bi bi-arrow-down"></i>
          </button>
          <button 
            class="btn-action"
            @click="$emit('duplicate')"
            title="Duplicar"
          >
            <i class="bi bi-copy"></i>
          </button>
        </div>
        <button 
          class="btn-action delete"
          @click="confirmDelete"
          title="Eliminar"
        >
          <i class="bi bi-trash"></i>
          Eliminar
        </button>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-dialog">
          <h3>¿Eliminar pregunta?</h3>
          <p>Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="btn-confirm" @click="handleDelete">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  isExam: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'remove', 'move-up', 'move-down', 'duplicate'])

// State
const isExpanded = ref(true)
const showDeleteConfirm = ref(false)

// Create a local reactive copy
const localQuestion = reactive({
  question_text: props.question.question_text || '',
  help_text: props.question.help_text || '',
  placeholder: props.question.placeholder || '',
  is_required: props.question.is_required || false,
  points: props.question.points || 0,
  options: props.question.options?.map(o => ({ ...o })) || []
})

// Watch for external changes
watch(() => props.question, (newVal) => {
  localQuestion.question_text = newVal.question_text || ''
  localQuestion.help_text = newVal.help_text || ''
  localQuestion.placeholder = newVal.placeholder || ''
  localQuestion.is_required = newVal.is_required || false
  localQuestion.points = newVal.points || 0
  localQuestion.options = newVal.options?.map(o => ({ ...o })) || []
}, { deep: true })

// Computed
const typeIcon = computed(() => {
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
  return icons[props.question.type_code] || 'bi bi-question-circle'
})

const hasError = computed(() => {
  return !localQuestion.question_text?.trim()
})

// Methods
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleUpdate() {
  emit('update', {
    question_text: localQuestion.question_text,
    help_text: localQuestion.help_text,
    placeholder: localQuestion.placeholder,
    is_required: localQuestion.is_required,
    points: localQuestion.points,
    options: localQuestion.options
  })
}

function addOption() {
  const newOption = {
    temp_id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    option_text: '',
    option_value: '',
    is_correct: false,
    points: 0,
    display_order: localQuestion.options.length
  }
  localQuestion.options.push(newOption)
  handleUpdate()
}

function removeOption(index) {
  if (localQuestion.options.length <= 2) return
  localQuestion.options.splice(index, 1)
  localQuestion.options.forEach((opt, i) => opt.display_order = i)
  handleUpdate()
}

function toggleCorrect(index) {
  const option = localQuestion.options[index]
  
  if (props.question.type_code === 'RADIO' || props.question.type_code === 'SELECT') {
    // Single selection - only one can be correct
    localQuestion.options.forEach((opt, i) => {
      opt.is_correct = i === index
    })
  } else {
    // Multiple selection
    option.is_correct = !option.is_correct
  }
  
  handleUpdate()
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function handleDelete() {
  showDeleteConfirm.value = false
  emit('remove')
}
</script>

<style scoped>
.question-editor {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.question-editor:hover {
  border-color: #d1d5db;
}

.question-editor.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.question-editor.has-error {
  border-color: #fca5a5;
}

/* Header */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
}

.question-header:hover {
  background: #f9fafb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  color: #9ca3af;
  cursor: grab;
  padding: 4px;
}

.drag-handle:hover {
  color: #6b7280;
}

.question-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #001845;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #6b7280;
  flex-shrink: 0;
}

.question-preview {
  color: #374151;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-badge {
  padding: 4px 10px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.points-badge {
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.btn-expand {
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

/* Content */
.question-content {
  padding: 0 20px 20px;
  border-top: 1px solid #f3f4f6;
}

.form-group {
  margin-top: 16px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #dc2626;
}

.optional {
  color: #9ca3af;
  font-weight: 400;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.15s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.1);
}

/* Options */
.options-section {
  margin-top: 16px;
}

.options-section > label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.option-drag {
  color: #9ca3af;
  cursor: grab;
}

.correct-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.correct-toggle:hover {
  border-color: #10b981;
  color: #10b981;
}

.correct-toggle.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.option-item input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
}

.option-points {
  width: 70px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.btn-remove-option {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-remove-option:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.btn-remove-option:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-add-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  margin-top: 12px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-option:hover {
  border-color: #001845;
  color: #001845;
  background: #f8fafc;
}

/* Settings Row */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #001845;
}

.checkbox-label span {
  font-size: 0.875rem;
  color: #374151;
}

.points-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-input label {
  font-size: 0.875rem;
  color: #6b7280;
}

.points-input input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

/* Actions */
.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.actions-left {
  display: flex;
  gap: 8px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-action.delete {
  color: #dc2626;
  border-color: #fecaca;
}

.btn-action.delete:hover {
  background: #fee2e2;
}

/* Option animations */
.option-list-enter-active,
.option-list-leave-active {
  transition: all 0.2s;
}

.option-list-enter-from,
.option-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.confirm-dialog h3 {
  margin: 0 0 8px 0;
  color: #111827;
}

.confirm-dialog p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-confirm {
  background: #dc2626;
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .question-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .option-item {
    flex-wrap: wrap;
  }
  
  .option-item input[type="text"] {
    min-width: 200px;
  }
  
  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>