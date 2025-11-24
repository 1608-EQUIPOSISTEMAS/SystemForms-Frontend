import api from './api'
import ProgramService from './program.service'
import ComercialService from './comercial.service'


// Symbols para inject (evita colisiones)
export const ServiceKeys = {
  Program:   Symbol('ProgramService'),
  Comercial: Symbol('ComercialService')
}

export function createServices() {
  return {
    [ServiceKeys.Program]:   new ProgramService(api),
    [ServiceKeys.Comercial]: new ComercialService(api),
  }
}
