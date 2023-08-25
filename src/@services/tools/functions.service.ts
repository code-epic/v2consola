import { Injectable } from '@angular/core';


export interface IFunciones {
  id: string,
  tipo: string,
  nombre: string,
  version: string,
  lenguaje: string,
  categoria: string,
  retorno: string,
  codigo: string,
  descripcion: string,
  parametros: string,
  fecha : string
  tiempo : string
  estatus : number
}


@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  constructor() { }
}
