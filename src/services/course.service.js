// frontend/src/services/course.service.js
import api from './api'

class CourseService {
  
  async list() {
    const response = await api.get('/courses')
    return response.data
  }

  async getById(id) {
    const response = await api.get(`/courses/${id}`)
    return response.data
  }

  async update(id, data) {
    const response = await api.put(`/courses/${id}`, data)
    return response.data
  }
}

export const courseService = new CourseService()