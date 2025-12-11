// frontend/src/stores/formBuilder.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formService } from '@/services/form.service'

export const useFormBuilderStore = defineStore('formBuilder', () => {
  // Estado
  const questionTypes = ref([])
  const form = ref({
    title: '',
    description: '',
    form_type: 'SURVEY',
    course_id: null,
    settings: {
      is_active: true,
      is_public: false,
      requires_login: true,
      available_from: null,
      available_until: null,
      time_limit_minutes: null,
      allow_multiple_responses: false,
      show_progress_bar: true,
      shuffle_questions: false,
      passing_score: null,
      show_score_after_submit: false,
      show_correct_answers: false,
      welcome_message: '',
      submit_message: 'Gracias por completar el formulario.'
    }
  })
  const sections = ref([])
  const questions = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const isDirty = ref(false)

  // Getters
  const hasQuestions = computed(() => questions.value.length > 0)
  const questionsCount = computed(() => questions.value.length)
  const isExam = computed(() => form.value.form_type === 'EXAM')

  // Acciones
  async function loadQuestionTypes() {
    if (questionTypes.value.length > 0) return
    try {
      const response = await formService.getQuestionTypes()
      if (response.ok) {
        questionTypes.value = response.data.types
      }
    } catch (error) {
      console.error('Error loading question types:', error)
    }
  }

  function resetForm() {
    form.value = {
      title: '',
      description: '',
      form_type: 'SURVEY',
      course_id: null,
      settings: {
        is_active: true,
        is_public: false,
        requires_login: true,
        available_from: null,
        available_until: null,
        time_limit_minutes: null,
        allow_multiple_responses: false,
        show_progress_bar: true,
        shuffle_questions: false,
        passing_score: null,
        show_score_after_submit: false,
        show_correct_answers: false,
        welcome_message: '',
        submit_message: 'Gracias por completar el formulario.'
      }
    }
    sections.value = []
    questions.value = []
    isDirty.value = false
  }

  function addQuestion(typeId) {
    const type = questionTypes.value.find(t => t.id === typeId)
    if (!type) return null

    const newQuestion = {
      temp_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question_type_id: typeId,
      type_code: type.code,
      type_name: type.name,
      has_options: type.has_options,
      question_text: '',
      help_text: '',
      placeholder: '',
      is_required: false,
      display_order: questions.value.length,
      points: 0,
      validation_rules: null,
      config: getDefaultConfig(type.code),
      options: type.has_options ? [
        { temp_id: `opt_${Date.now()}_1`, option_text: 'Opción 1', display_order: 0, is_correct: false, points: 0 },
        { temp_id: `opt_${Date.now()}_2`, option_text: 'Opción 2', display_order: 1, is_correct: false, points: 0 }
      ] : []
    }

    questions.value.push(newQuestion)
    isDirty.value = true
    return newQuestion
  }

  function getDefaultConfig(typeCode) {
    switch (typeCode) {
      case 'SCALE':
        return { min: 1, max: 10, step: 1, min_label: '', max_label: '' }
      case 'RATING':
        return { max_stars: 5 }
      case 'NUMBER':
        return { min: null, max: null, step: 1 }
      default:
        return null
    }
  }

  function updateQuestion(tempId, updates) {
    const index = questions.value.findIndex(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (index !== -1) {
      questions.value[index] = { ...questions.value[index], ...updates }
      isDirty.value = true
    }
  }

  function removeQuestion(tempId) {
    const index = questions.value.findIndex(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (index !== -1) {
      questions.value.splice(index, 1)
      // Reordenar
      questions.value.forEach((q, i) => q.display_order = i)
      isDirty.value = true
    }
  }

  function moveQuestion(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    const [moved] = questions.value.splice(fromIndex, 1)
    questions.value.splice(toIndex, 0, moved)
    questions.value.forEach((q, i) => q.display_order = i)
    isDirty.value = true
  }

  function duplicateQuestion(tempId) {
    const original = questions.value.find(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (!original) return

    const duplicate = {
      ...JSON.parse(JSON.stringify(original)),
      id: undefined,
      temp_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question_text: `${original.question_text} (copia)`,
      display_order: questions.value.length,
      options: original.options?.map((opt, i) => ({
        ...opt,
        id: undefined,
        temp_id: `opt_${Date.now()}_${i}`
      })) || []
    }

    questions.value.push(duplicate)
    isDirty.value = true
    return duplicate
  }

  function addOption(questionTempId) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question || !question.has_options) return

    const newOption = {
      temp_id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      option_text: `Opción ${question.options.length + 1}`,
      option_value: '',
      display_order: question.options.length,
      is_correct: false,
      points: 0
    }

    question.options.push(newOption)
    isDirty.value = true
    return newOption
  }

  function updateOption(questionTempId, optionTempId, updates) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question) return

    const optIndex = question.options.findIndex(o => 
      o.temp_id === optionTempId || o.id === optionTempId
    )
    if (optIndex !== -1) {
      question.options[optIndex] = { ...question.options[optIndex], ...updates }
      isDirty.value = true
    }
  }

  function removeOption(questionTempId, optionTempId) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question) return

    const optIndex = question.options.findIndex(o => 
      o.temp_id === optionTempId || o.id === optionTempId
    )
    if (optIndex !== -1) {
      question.options.splice(optIndex, 1)
      question.options.forEach((o, i) => o.display_order = i)
      isDirty.value = true
    }
  }

  async function saveForm() {
    saving.value = true
    try {
      const payload = {
        title: form.value.title,
        description: form.value.description,
        form_type: form.value.form_type,
        course_id: form.value.course_id,
        settings: form.value.settings,
        sections: sections.value,
        questions: questions.value.map(q => ({
          ...q,
          id: q.id || undefined, // Solo enviar si existe
          temp_id: q.temp_id
        }))
      }

      const response = await formService.create(payload)
      if (response.ok) {
        isDirty.value = false
        return response.data
      }
      throw new Error(response.error || 'Error al guardar')
    } finally {
      saving.value = false
    }
  }

  async function updateForm(uuid) {
    saving.value = true
    try {
      // Preparar settings
      const settings = {
        is_active: form.value.settings.is_active,
        is_public: form.value.settings.is_public,
        requires_login: form.value.settings.requires_login,
        available_from: form.value.settings.available_from || null,
        available_until: form.value.settings.available_until || null,
        time_limit_minutes: form.value.settings.time_limit_minutes || null,
        allow_multiple_responses: form.value.settings.allow_multiple_responses,
        show_progress_bar: form.value.settings.show_progress_bar,
        shuffle_questions: form.value.settings.shuffle_questions,
        passing_score: form.value.settings.passing_score || null,
        show_score_after_submit: form.value.settings.show_score_after_submit,
        show_correct_answers: form.value.settings.show_correct_answers,
        welcome_message: form.value.settings.welcome_message || null,
        submit_message: form.value.settings.submit_message || null
      }

      // Preparar preguntas
      const preparedQuestions = questions.value.map((q, index) => ({
        id: q.id || null, // null si es nueva
        temp_id: q.temp_id,
        question_type_id: q.question_type_id,
        question_text: q.question_text,
        help_text: q.help_text || null,
        placeholder: q.placeholder || null,
        is_required: !!q.is_required,
        display_order: index,
        points: parseFloat(q.points) || 0,
        validation_rules: q.validation_rules || null,
        config: q.config || null,
        has_options: !!q.has_options,
        options: q.options?.map((opt, optIndex) => ({
          id: opt.id || null,
          temp_id: opt.temp_id,
          option_text: opt.option_text,
          option_value: opt.option_value || opt.option_text,
          display_order: optIndex,
          is_correct: !!opt.is_correct,
          points: parseFloat(opt.points) || 0
        })) || []
      }))

      const payload = {
        title: form.value.title,
        description: form.value.description,
        settings,
        questions: preparedQuestions
      }

      const response = await formService.update(uuid, payload)
      
      if (response.ok) {
        isDirty.value = false
        return true
      }
      throw new Error(response.error || 'Error al actualizar')
    } catch (error) {
      console.error('Error updating form:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // También asegurarse de que loadForm mapee correctamente las opciones
  async function loadForm(uuid) {
    loading.value = true
    try {
      const response = await formService.getByUuid(uuid)
      if (response.ok) {
        const { form: formData, sections: secs, questions: qs } = response.data
        
        form.value = {
          id: formData.id,
          uuid: formData.uuid,
          title: formData.title,
          description: formData.description,
          form_type: formData.form_type,
          course_id: formData.course_id,
          settings: {
            is_active: !!formData.is_active,
            is_public: !!formData.is_public,
            requires_login: !!formData.requires_login,
            available_from: formatDateTimeLocal(formData.available_from),
            available_until: formatDateTimeLocal(formData.available_until),
            time_limit_minutes: formData.time_limit_minutes,
            allow_multiple_responses: !!formData.allow_multiple_responses,
            show_progress_bar: !!formData.show_progress_bar,
            shuffle_questions: !!formData.shuffle_questions,
            passing_score: formData.passing_score,
            show_score_after_submit: !!formData.show_score_after_submit,
            show_correct_answers: !!formData.show_correct_answers,
            welcome_message: formData.welcome_message || '',
            submit_message: formData.submit_message || ''
          }
        }
        
        sections.value = secs || []
        
        // Mapear preguntas con sus opciones
        questions.value = qs.map(q => ({
          id: q.id,
          question_type_id: q.question_type_id,
          type_code: q.type_code,
          type_name: q.type_name || getTypeName(q.type_code),
          question_text: q.question_text,
          help_text: q.help_text || '',
          placeholder: q.placeholder || '',
          is_required: !!q.is_required,
          display_order: q.display_order,
          points: q.points || 0,
          has_options: !!q.has_options,
          validation_rules: q.validation_rules,
          config: q.config,
          options: (q.options || []).map(opt => ({
            id: opt.id,
            option_text: opt.option_text || opt.text,
            option_value: opt.option_value || opt.value || opt.text,
            display_order: opt.display_order || opt.order,
            is_correct: !!opt.is_correct,
            points: opt.points || 0
          }))
        }))
        
        isDirty.value = false
        return true
      }
      return false
    } catch (error) {
      console.error('Error loading form:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // Helper para formatear fecha para input datetime-local
  function formatDateTimeLocal(dateString) {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      // Format: YYYY-MM-DDTHH:mm
      return date.toISOString().slice(0, 16)
    } catch {
      return null
    }
  }

  // Helper para obtener nombre del tipo
  function getTypeName(code) {
    const names = {
      TEXT: 'Texto Corto',
      TEXTAREA: 'Texto Largo',
      SELECT: 'Lista Desplegable',
      RADIO: 'Opción Única',
      CHECKBOX: 'Opción Múltiple',
      NUMBER: 'Número',
      EMAIL: 'Correo Electrónico',
      DATE: 'Fecha',
      TIME: 'Hora',
      DATETIME: 'Fecha y Hora',
      FILE: 'Archivo',
      RATING: 'Calificación',
      SCALE: 'Escala Lineal'
    }
    return names[code] || code
  }

  return {
    // State
    questionTypes,
    form,
    sections,
    questions,
    loading,
    saving,
    isDirty,
    // Getters
    hasQuestions,
    questionsCount,
    isExam,
    // Actions
    loadQuestionTypes,
    resetForm,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    saveForm,
    loadForm,
    updateForm
  }
})