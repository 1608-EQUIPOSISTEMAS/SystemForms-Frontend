// services/ComercialService.js
import api from './api';

export default class ComercialService {
  async leadRegister(payload) {
    return (await api.post('/comercial/leadregister', payload)).data;
  }
  async enrollmentRegister(payload) {
    return (await api.post('/comercial/enrollmentregister', payload)).data;
  }
  async leadList(payload) {
    const response = (await api.post('/comercial/leadlist', payload)).data;
    console.log(response)
    return response.data;
  }

  async leadGet(payload) {
    const response = (await api.post('/comercial/leadget', payload)).data;
    console.log(response)
    return response.data;
    
  }
  
}
