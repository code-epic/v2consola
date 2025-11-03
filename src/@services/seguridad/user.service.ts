import { Injectable } from "@angular/core"
// usuario.model.ts
export interface SPrivilegios {
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
  Privilegios: SPrivilegios[];
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
  Privilegios: SPrivilegios[];
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
  perfil: string;
  traza: string;
  estatus: number;
  tiempo: string;
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
  descripcion: string;
  observaciones: string;
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

interface AplicacionAgrupada {
  id: string;
  nombresAplicacion: string; // Títulos de la aplicación, por si son diferentes
  rolesCombinados: string;   // Rol.descripcion concatenadas
  menuUnificado: SMenu[];     // Menús fusionados sin duplicados
  itemsOriginales: SAplicacion[]; // Referencia a los items originales (opcional)
}


@Injectable({ providedIn: 'root' })

export class UserService implements Usuario {

  cedula = '';
  nombre = '';
  descripcion= '';
  observaciones = '';
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

   // Propiedad de clase estándar para almacenar el resultado agrupado
  public groupedApplications: AplicacionAgrupada[] = [];

  iniciarObjeto(): void {
    this.cedula = '';
    this.nombre = '';
    this.descripcion = '';
    this.observaciones = '';
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



  




  /**
   * Función que agrupa los elementos de Aplicacion por su 'id'
   * y fusiona las propiedades 'Rol.descripcion' y 'Rol.Menu' utilizando
   * un Map para una alta eficiencia O(N).
   */
  groupApplications(Usr: Usuario): void {
    const groupedMap = new Map<string, AplicacionAgrupada>();

    for (const item of Usr.Aplicacion) {
      const appId = item.id;

      if (groupedMap.has(appId)) {
        // La aplicación ya existe en el mapa (FUSIONAR)
        const existingGroup = groupedMap.get(appId)!;

        // 1. Concatenar Rol.descripcion (evitando duplicados si el texto es idéntico)
        const newDescription = item.Rol.descripcion;
        // La validación simple de 'includes' evita añadir roles duplicados
        if (!existingGroup.rolesCombinados.includes(newDescription)) {
          existingGroup.rolesCombinados += ' | ' + newDescription;
        }

        // 2. Fusionar Rol.Menu sin duplicados (usando 'nombre' como clave única)
        existingGroup.menuUnificado = this.mergeMenus(
          existingGroup.menuUnificado,
          item.Rol.Menu
        );

        // 3. Añadir el item original al array de referencia (opcional)
        existingGroup.itemsOriginales.push(item);

      } else {
        // Es la primera vez que encontramos esta aplicación (INICIALIZAR)
        groupedMap.set(appId, {
          id: appId,
          nombresAplicacion: item.nombre,
          rolesCombinados: item.Rol.descripcion,
          menuUnificado: [...item.Rol.Menu], // Copia superficial de los menús
          itemsOriginales: [item],
        });
      }
    }

    // Asignar el resultado final a la propiedad de clase estándar (sin usar .set o Signals)
    this.groupedApplications = Array.from(groupedMap.values());
  }

  /**
   * Fusiona dos arrays de Menu, manteniendo solo las entradas únicas basadas en el 'nombre' del menú.
   * Utiliza un Map para una búsqueda de duplicados rápida.
   * @param existingMenus Menús ya existentes en el grupo.
   * @param newMenus Nuevos menús a añadir.
   * @returns Array de menús fusionados sin duplicados.
   */
  private mergeMenus(existingMenus: SMenu[], newMenus: SMenu[]): SMenu[] {
    const menuMap = new Map<string, SMenu>();

    // 1. Agregar menús existentes al mapa
    existingMenus.forEach(menu => menuMap.set(menu.nombre, menu));

    // 2. Agregar nuevos menús. Si el nombre ya existe, lo ignoramos para evitar duplicados.
    for (const newMenu of newMenus) {
      if (!menuMap.has(newMenu.nombre)) {
        menuMap.set(newMenu.nombre, newMenu);
      }
    }

    // Convertir el Map de nuevo a un Array para el resultado final
    return Array.from(menuMap.values());
  }






}