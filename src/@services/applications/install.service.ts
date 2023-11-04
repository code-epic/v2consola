import { Injectable } from '@angular/core';


export interface SSB_IAplicacion {
  identificador ?:number
  basedatos?: string
  lenguaje?: string
  nombre?: string
  observacion?: string
  clave?: string
  puntoMontaje?: string
  origen?: string
  repositorio?: string
  sistema?: string
  tipo?: number
  usuario?: string
  creador?: string
  version?: string
  llave ?: string
}

/**
 * 
 */
export interface IAApi {
  id?: string
  nomb?: string
  func?: string
  descr?: string
  param?: string
  esta?: number
  idapp: number
}

@Injectable({
  providedIn: 'root'
})


export class InstallService {

  constructor() { }
}
