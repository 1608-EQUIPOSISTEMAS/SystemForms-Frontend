// frontend/src/services/ProgramService.js
import api from './api';

export default class ProgramService {
  async programList(payload) {
    const response = (await api.post('/program/programlist', payload,{
    meta: { skipLoader: true }       // 👈 no muestres overlay para esta llamada
  })).data;
    return response.data.items; // mismo shape que ya usas
  }

  // NUEVO: listar ediciones por versión
  async editionList(payload) {
    // payload: { program_version_id, only_active?, page?, size? }
    const response = (await api.post('/program/editionlist', payload,{
    meta: { skipLoader: true }       // 👈 no muestres overlay para esta llamada
  })).data;
    return response.data.items;
  }
}
