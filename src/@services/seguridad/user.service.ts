import { Injectable } from "@angular/core"
// usuario.model.ts
export interface SPrivilegio {
  metodo: string;
  descripcion: string;
  accion: string;
  directivas: string;
  endpoint: string;
  funcion: string;
}

export interface SSubMenu {
  url: string;
  js: string;
  descripcion: string;
  icono: string;
  nombre: string;
  accion: string;
  clase: string;
  color: string;
  Privilegios: SPrivilegio[];
  SubMenu: SSubMenu[];
}

export interface SMenu {
  url: string;
  js: string;
  icono: string;
  descripcion: string;
  nombre: string;
  accion: string;
  clase: string;
  color: string;
  Privilegio: SPrivilegio[];
  SubMenu: SSubMenu[];
}

export interface SRol {
  descripcion: string;
  Menu: SMenu[];
}

export interface SAplicacion {
  id: string;
  nombre: string;
  url: string;
  comentario: string;
  version: string;
  autor: string;
  Rol: SRol;
}

export interface Perfil {
  descripcion: string;
  traza: string;
}

export interface Firmadigital {
  vigencia: number, //dias
  duracion: number, //segundos
  direccionmac: string;
  direccionip: string;
  tiempo: string;
  nivel: number; //entero 0 BAJA, 1 MEDIA, 2 ALTA
}

export interface Usuario {
  cedula: string;
  nombre: string;
  login: string;
  correo: string;
  estatus: number;
  clave: string;
  endpoint: string;
  sucursal: string; //equivale a la oficina
  direccion: string; //regional
  cargo: string;
  telefono: string;
  sistema: string;
  token: string;
  Perfil: Perfil;
  Aplicacion: SAplicacion[];
  firmadigital: Firmadigital;
}

@Injectable({ providedIn: 'root' })

export class UserService implements Usuario {

  cedula = '';
  nombre = '';
  login = '';
  correo = '';
  clave = '';
  sucursal = '';
  direccion = '';
  cargo = '';
  telefono = '';
  sistema = '';
  token = '';
  endpoint = '';
  estatus = 1;
  Perfil: Perfil = { descripcion: '', traza : '' };
  Aplicacion: SAplicacion[] = [];
  firmadigital: Firmadigital = {
    duracion: 0,
    direccionmac: '*',
    direccionip: '*',
    tiempo: new Date().toISOString(),
    vigencia: 0,
    nivel: 0
  };

  iniciarObjeto(): void {
    this.cedula = '';
    this.nombre = '';
    this.login = '';
    this.correo = '';
    this.clave = '';
    this.sucursal = '';
    this.direccion = '';
    this.cargo = '';
    this.telefono = '';
    this.endpoint = '';
    this.sistema = '';
    this.token = '';
    this.estatus = 1;
    this.Perfil = { descripcion: '', traza : '' };
    this.Aplicacion = [];
    this.firmadigital = {
      duracion: 0,
      direccionmac: '*',
      direccionip: '*',
      tiempo: new Date().toISOString(),
      vigencia: 0,
      nivel: 0
    };
  }

  limpiarObjeto(): void {
    this.iniciarObjeto();
  }

  validarCampos(): string[] {
    const errores: string[] = [];
    const regex = {
      cedula: /^[0-9]+$/,
      nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/,
      login: /^[a-zA-Z0-9_\-]+$/,
      correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      telefono: /^\+?[0-9\s\-()]+$/
    };

    if (!regex.cedula.test(this.cedula)) {
      errores.push('La cédula solo puede contener números');
    }

    if (!regex.nombre.test(this.nombre)) {
      errores.push('El nombre contiene caracteres no permitidos');
    }

    if (!regex.login.test(this.login)) {
      errores.push('El login solo puede contener letras, números y guiones');
    }

    if (!regex.correo.test(this.correo)) {
      errores.push('El correo electrónico no es válido');
    }

    if (!regex.telefono.test(this.telefono)) {
      errores.push('El teléfono contiene caracteres no válidos');
    }

    return errores;
  }

  // Método para crear instancia desde JSON
  static fromJSON(json: any): UserService {
    const usuario = new UserService();
    Object.assign(usuario, json);
    return usuario;
  }

  // Método para convertir a JSON
  toJSON(): Usuario {
    return { ...this };
  }
}