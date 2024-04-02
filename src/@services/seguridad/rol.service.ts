import { Injectable } from '@angular/core';



export interface IUser {
  tipoacceso: number
  respaldo: number
  endpoint: string
  login: string
  clave: string
  encriptamiento: string
  nombre: string
  descripcion: string
  estatus: number
  vigencia: number //80 a 160 dias
  correo: string
  observaciones: string
  duraciontexto: number
  duraciontiempo: number
  oficina: string
  regional: string
}

export interface IRol {
  nombre: string,
  descripcion: string,
  estatus: number,
  Menu?: Menu[]
}




export interface IPerfil {
  nombre: string,
  descripcion: string,
  estatus: number,
  aplicacion: number
}



export interface Aplicacion {
  id?: string,
  nombre: string,
  url: string,
  comentario: string,
  version: string,
  autor: string,
  Rol?: IRol
}


export interface SubMenu {
  url: string,
  js: string,
  icono: string,
  descripcion: string,
  nombre: string,
  accion: string,
  clase: string,
  color: string,
  Privilegios?: Privilegios[]
  //SubMenu: []
}

export interface Menu {
  url: string,
  js: string,
  icono: string,
  descripcion: string,
  nombre: string,
  accion: string,
  clase: string,
  color: string,
  Privilegios?: Privilegios[],
  SubMenu?: SubMenu[]
}

export interface Privilegios {
  metodo: string,
  descripcion: string,
  accion: string,
  directivas: string
}



@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor() { }
}
