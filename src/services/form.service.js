// src/services/form.service.js
import api from './api'

class FormService {
  
  async getQuestionTypes() {
    const response = await api.get('/forms/question-types')
    return response.data
  }

  async create(formData) {
    const response = await api.post('/forms', formData)
    return response.data
  }

  // ✅ FORMULARIO PÚBLICO (sin autenticación requerida en el backend)
  async getPublic(uuid) {
    const response = await api.get(`/forms/public/${uuid}`)
    return response // Retorna la respuesta completa de axios
  }

  async list(params = {}) {
    const response = await api.get('/forms', { params })
    return response.data
  }

  // Alias para compatibilidad
  async get(uuid) {
    const response = await api.get(`/forms/${uuid}`)
    return response.data
  }

  async getByUuid(uuid) {
    const response = await api.get(`/forms/${uuid}`)
    return response.data
  }

  async update(uuid, formData) {
    const response = await api.put(`/forms/${uuid}`, formData)
    return response.data
  }

  async delete(uuid) {
    const response = await api.delete(`/forms/${uuid}`)
    return response.data
  }

  async getResponseDetail(formUuid, responseId) {
    const response = await api.get(`/forms/${formUuid}/responses/${responseId}`)
    return response.data
  }

  async duplicate(uuid) {
    const response = await api.post(`/forms/${uuid}/duplicate`)
    return response.data
  }

  // Estadísticas
  async getStats(uuid) {
    const response = await api.get(`/forms/${uuid}/stats`)
    return response.data
  }

  // Respuestas
  async getResponses(uuid, params = {}) {
    const response = await api.get(`/forms/${uuid}/responses`, { params })
    return response.data
  }

  // Exportar
  async exportResponses(uuid, params = {}) {
    const response = await api.get(`/forms/${uuid}/responses/export`, { 
      params,
      responseType: 'blob'
    })
    return response
  }
}

export const formService = new FormService()
export default new FormService()