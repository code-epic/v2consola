import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap"
import { ApiService, IAPICore } from "@services/apicore/api.service"
import { IPerfil, Privilegios } from "@services/seguridad/rol.service"
import { UtilService } from "@services/util/util.service"
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable"
import { environment } from "environments/environment"
import { BlockUI, NgBlockUI } from "ng-block-ui"
import Swal from "sweetalert2"
import { aplicacion } from "app/menu/schema"
import { Menu } from "@services/seguridad/login.service"
import { Md5 } from "ts-md5"




interface MenuItem {
  url: string;
  js: string;
  icono: string;
  descripcion: string;
  nombre: string;
  accion: string;
  clase: string;
  color: string;
  Privilegio: any[];
  SubMenu: SubMenu[];
}


// Interfaces para la estructura de permisos de 3 niveles

// Nivel 3: Privilegio (la acción más específica)
interface Privilegio {
  accion: string;
  descripcion: string;
  metodo: string;
  estatus: number;
}

// Nivel 2: SubMenu (agrupa privilegios)
interface SubMenu {
  url: string;
  js: string;
  icono: string;
  descripcion: string;
  nombre: string;
  accion: string;
  clase: string;
  color: string;
  estatus: number;
  menu: string;
  modulo: string

  children?: Privilegio[]; // Hijos son los privilegios
  isExpanded?: boolean;     // Para controlar la UI
  Privilegios?: Privilegios[];    // Datos originales
}

// Nivel 1: PermisoPadre (la fila principal de la tabla, agrupa SubMenus)
interface PermisoPadre {
  accion: string;
  menu: string;
  modulo: string;
  estatus: number;
  children?: SubMenu[]; // Hijos son los SubMenus
  isExpanded?: boolean;      // Estado de la expansión de la fila
}

interface Rol {
  descripcion: string
  Menu: MenuItem[]
}

interface PerfilSave {
  nombre: string
  descripcion: string
  estatus: number
  aplicacion: string
  version: string
  llave: string
  id?: string
  Rol: Rol
}




@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class ProfileComponent implements OnInit {

  public perfilSave: PerfilSave = {
    nombre: "",
    descripcion: "",
    estatus: 1,
    aplicacion: "",
    version: "",
    llave: "",
    id: "",
    Rol: {
      descripcion: "",
      Menu: []
    }
  }

  @ViewChild(DatatableComponent) table: DatatableComponent
  @BlockUI() blockUI: NgBlockUI
  @BlockUI("section-block") sectionBlockUI: NgBlockUI

  public contentHeader: object

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  }

  public SelectionType = SelectionType
  public basicSelectedOption: number = 100

  public Perfil: IPerfil = {
    nombre: "",
    descripcion: "",
    estatus: 1,
    aplicacion: 0,
  }

  public showDiv: boolean = false
  public lstAplicaciones = []
  public lstRol = []
  public dataRolDetalles: PermisoPadre[] = [];
  public dataRol: any[] = []
  public datamenu = []
  public rowData = []
  public temprowData = []
  public countSubMenu
  public rowDataAcc = []
  public lista = []


  public estatus = undefined

  public aplicacion
  public xmodulo
  public menu

  public modulo: string = ''
  public moduloid: string = ''
  public menuid: string = ''
  public accionid

  public btnMenu = false

  public xnombre = ''
  public xdescripcion = ''

  public xaccion = ''
  public rol = undefined
  public registrar = "Registrar nuevo perfil"

  @ViewChild("rowDetail") rowDetail: any


  public ColumnMode = ColumnMode
  public chkBoxSelected = []
  public lstPerfil = []
  public SelectOn = []
  public blApp: boolean = true
  public xaplicacion = ''
  public xrol = ''
  public nombreAplicacion = ''
  public versionAplicacion = ''
  public llaveAplicacion = ''



  active: any = 1

  // Lógica de transformación
  public dataPlana: any[] = [];

  public dataJerarquica: PermisoPadre[] = [];
  public padresMap = new Map<string, PermisoPadre>();

  public desactivo = 'false'


  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.dataRolDetalles = []
    this.contentHeader = {
      headerTitle: "Seguridad",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Principal",
            isLink: true,
            link: "/home",
          },
          {
            name: "Seguridad",
            isLink: false,
          },
          {
            name: "Definir Perfil",
            isLink: false,
          },
        ],
      },
    }
    this.desactivo = 'false'

    this.CargarListaAplicaciones()
    this.listarPerfiles()
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACIONES
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.map((e) => {
          e.name = e.nombre
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  obtenerAplicacion(id) {
    return this.lstAplicaciones.find((item) => item.id == id)

  }

  listarPerfiles() {
    this.xAPI.funcion = environment.functions.CONSULTAR_LISTA_PERFILES
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.lstPerfil = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        this.lstPerfil = data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selTab(e) {
    if (this.active == 2) {
      this.blApp = true
      this.dataRolDetalles = []
      this.dataPlana = []
      this.dataJerarquica = []
      this.padresMap = new Map<string, PermisoPadre>();
      this.SelectOn = []
      this.lista = []
      // this.rol = undefined
      this.Perfil.descripcion = ''
      this.Perfil.nombre = ''
      
      
    } else {
      this.registrar = "Registrar nuevo perfil"
      this.desactivo = 'false'
      
    }
  }

  onSelect({ selected }) {
    console.log(selected)
    this.SelectOn = selected
  }

  selRol(event: any): void {

    this.dataRol = []
    this.dataRolDetalles = []
    this.dataPlana = []
    this.dataJerarquica = []
    this.xrol = ''
    this.Perfil.nombre = ''
    this.Perfil.descripcion = ''

    this.aplicacion = this.obtenerAplicacion(event)


    this.dataRol = []
    let rol = {
      "app": event,
      "estatus": "1",
      "id": event,
      "llave": this.aplicacion.autor,
      "observacion": this.aplicacion.comentario,
      "name": this.aplicacion.Rol.descripcion
    }
    this.xrol = this.aplicacion.Rol.descripcion
    this.xaplicacion = this.aplicacion.nombre
    this.dataRol.push(rol)


  }

  selRolDetalle(row: any = null): void {
    this.dataRolDetalles = []
    this.dataPlana = []
    this.dataJerarquica = []
    let lst = []

    this.aplicacion.Rol.Menu.forEach(mnu => {
      let obj = {
        "accion": "-",
        "menu": mnu.nombre,
        "modulo": mnu.descripcion,
        "rol": "Sistema",
        "xaccion": null,
        "xmenu": "1",
        "xmodulo": "",
        "xrol": "1",
        "estatus": 0
      }
      lst.push(obj)
      if (mnu.SubMenu.length > 0) {
        mnu.SubMenu.forEach(sub => {
          let obj = {
            "accion": sub.nombre,
            "menu": mnu.nombre,
            "modulo": mnu.descripcion,
            "rol": "Sistema",
            "xaccion": null,
            "xmenu": "1",
            "xmodulo": "",
            "xrol": "1",
            "estatus": 0, // Se inicia en 0, la lógica de update se encargará de marcarlo
            "Privilegios": sub.Privilegios
          }
          lst.push(obj)

        })
      }
    });

    this.dataPlana = lst
    this.convertirDataPlana()
    // console.log(this.dataJerarquica)
    if (row != null) {
      this.dataRolDetalles = this.updateMenuEstatusOnly(this.dataJerarquica, row.Rol.Menu)
    } else {
      this.dataRolDetalles = this.dataJerarquica

    }
    // this.dataRolDetalles = this.dataJerarquica
    this.cd.detectChanges();
    return
  }

  convertirDataPlana() {
    const subMenuMap = new Map<string, SubMenu>();

    this.dataPlana.forEach(item => {
      const key = `${item.modulo}-${item.menu}`; // Usamos Modulo y Menu como clave del grupo

      if (item.accion === '-') {
        // Es un elemento padre (el grupo)
        const padre: PermisoPadre = { ...item, children: [], isExpanded: false } as PermisoPadre;
        this.padresMap.set(key, padre);
        this.dataJerarquica.push(padre);
      } else {
        // Es un SubMenú (hijo del padre)
        const padre = this.padresMap.get(key);
        if (padre) {
          const subMenu: SubMenu = {
            ...item,
            children: [],
            isExpanded: false
          };

          // Procesar los Privilegios y asignarlos como hijos del SubMenu
          if (item.Privilegios && item.Privilegios.length > 0) {
            subMenu.children = item.Privilegios.map(priv => ({
              accion: priv.descripcion,
              descripcion: priv.descripcion,
              metodo: priv.metodo,
              estatus: 0 // Por defecto, los privilegios están deseleccionados
            }));
          }

          padre.children!.push(subMenu);
        }
      }
    });
  }


  // En profile.component.ts, dentro de la clase ProfileComponent

  /**
   * Maneja el checkbox maestro de la cabecera. Recorre TODA la lista
   * de permisos y actualiza el 'estatus' de padres e hijos.
   */
  onMasterCheckboxChange(event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0; // Usamos 1 o 0 (number)

    this.dataRolDetalles.forEach(padre => {
      // 1. Actualizar el estado del Padre
      padre.estatus = newStatus;

      // 2. Actualizar el estado de todos los Hijos (cascada total)
      if (padre.children) {
        padre.children.forEach(child => {
          child.estatus = newStatus;
        });
      }
    });

    // CRÍTICO: Re-asignar el array fuerza a ngx-datatable a detectar y aplicar los cambios visuales.
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  // En profile.component.ts, dentro de la clase ProfileComponent

  // Asegúrate de usar la interfaz PermisoPadre para tipar
  onParentCheckboxChange(row: PermisoPadre, event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;

    // 1. Actualizar el estado del Padre (Nivel 1 - Módulo)
    row.estatus = newStatus;

    // 2. Actualizar en cascada el estado de todos los Hijos (Nivel 2 - SubMenús) y Nietos (Nivel 3 - Privilegios)
    if (row.children) {
      row.children.forEach(child => {
        child.estatus = newStatus;
        if (child.children) {
          child.children.forEach(privilegio => {
            privilegio.estatus = newStatus;
          });
        }
      });
    }

    // Opcional: Forzar la actualización de la tabla para que se refresque visualmente
    // Esto es crucial para que ngx-datatable reconozca el cambio de estado
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Maneja el checkbox del SubMenú (Nivel 2).
   * Actualiza sus Privilegios (Nivel 3) y recalcula el estado del Menú (Nivel 1).
   */
  onSubMenuCheckboxChange(subMenu: SubMenu, event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;
    subMenu.estatus = newStatus;

    // 1. Aplicar el estado a todos los Privilegios (Nivel 3)
    if (subMenu.children) {
      subMenu.children.forEach(privilegio => {
        privilegio.estatus = newStatus;
      });
    }

    // 2. Recalcular el estado del Menú principal (Nivel 1)
    this.recalcularEstadoPadre(subMenu.menu);

    // Forzar actualización de la tabla para ver los cambios
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Maneja el checkbox del Privilegio (Nivel 3).
   * Recalcula el estado del SubMenú (Nivel 2) y del Menú (Nivel 1).
   */
  onPrivilegeCheckboxChange(privilegio: Privilegio, subMenu: SubMenu, event: any): void {
    // Simplemente actualiza el estado del privilegio clickeado.
    privilegio.estatus = event.target.checked ? 1 : 0;

    // Se elimina la lógica que propaga el cambio hacia los padres (SubMenu y Módulo).
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Función auxiliar para recalcular el estado del Menú (Nivel 1) basado en sus SubMenús (Nivel 2).
   */
  recalcularEstadoPadre(menuNombre: string): void {
    const parent = this.padresMap.get(menuNombre);
    if (parent) {
      const todosSubMenusSeleccionados = parent.children!.every(subMenu => subMenu.estatus === 1);
      // Si todos los hijos (SubMenús) están seleccionados, el Padre (Menú) se selecciona.
      parent.estatus = todosSubMenusSeleccionados ? 1 : 0;
    }
  }

  /**
   * Recorre la estructura jerárquica y crea una lista plana 
   * solo con los elementos hijos (acciones) seleccionados.
   * @returns {PermisoAccion[]} Una lista de objetos PermisoAccion con estatus=1
   */
  listarPermisosSeleccionados(): any[] {
    const seleccionados: any[] = [];

    this.dataRolDetalles.forEach((padre) => {
      let padreDebeSerIncluido = false;
      const hijosSeleccionados: SubMenu[] = [];

      // 1. Caso: El Padre no tiene hijos (es una acción final)
      if (!padre.children || padre.children.length === 0) {
        if (padre.estatus === 1) {
          seleccionados.push({ ...padre, children: [] }); // Incluir al padre sin hijos
        }
        return; // Pasar al siguiente padre
      }

      // 2. Caso: El Padre tiene hijos
      padre.children.forEach(hijo => {
        if (hijo.estatus === 1) {
          hijosSeleccionados.push({ ...hijo }); // Incluir al hijo seleccionado
          padreDebeSerIncluido = true; // Si al menos un hijo está seleccionado, incluimos al padre
        }
      });

      // 3. Evaluar la inclusión del Padre
      if (padreDebeSerIncluido || padre.estatus === 1) {
        // Incluir al padre
        seleccionados.push(padre);

        // Incluir a los hijos seleccionados
        seleccionados.push(...hijosSeleccionados);
      }
    });

    console.log("Permisos Finales para Guardar:", seleccionados);
    return seleccionados;
  }



  consultarMenu(acc: string) {
    this.xAPI.funcion = environment.functions.LISTAR_MENUS
    this.xAPI.parametros = acc
    this.datamenu = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.datamenu = data.Cuerpo.map((e) => {
          e.name = e.nomb
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selectEventModulo(item) {
    this.consultarMenu(this.xmodulo[0].split("|")[0])
  }

  iniciarLista() {
    // console.log(this.dataRolDetalles)
    if (this.SelectOn.length == 0) {
      this.lista = this.dataRolDetalles.map((e) => {
        e.estatus = 0
        return e
      })
    } else {

      // console.log(this.SelectOn)

      this.lista = this.dataRolDetalles.map((e) => {
        let estatus = this.SelectOn.find((el) => {
          return el.modulo == e.modulo && el.menu == e.menu;
        });
        e.estatus = estatus != undefined ? 1 : 0
        return e
      })

    }
  }

  guardarPerfil() {
    this.iniciarLista()

    if (
      this.Perfil.nombre == "" ||
      this.lista.length == 0 ||
      this.Perfil.aplicacion == undefined
    ) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "Debe verificar los campos",
        3000
      )
      return false
    }
    this.xAPI.funcion = environment.functions.INSERTAR_PERFIL
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Perfil)

    // console.log(this.xAPI)
    // 
    // this.insertBach('Testing', 0)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lista = this.lista.filter(e => e.estatus == 1)
        this.insertBach(data.msj, 0)
      },
      (error) => {
        console.error("Data: ", error)
      }
    )
  }

  insertBach(idperfil, posicion) {
    if (posicion >= this.lista.length) {
      this.utilservice.AlertMini(
        "top-end",
        "success",
        "Finalizo con éxito",
        3000
      )
      this.dataRolDetalles = []
      this.Perfil.nombre = ''
      this.Perfil.descripcion = ''
      this.listarPerfiles()
    } else {

      let data = {
        aplicacion: this.Perfil.aplicacion,
        perfil: idperfil,
        rol: this.rol,
        modulo: parseInt(this.lista[posicion].xmodulo),
        menu: parseInt(this.lista[posicion].xmenu),
        accion: parseInt(this.lista[posicion].xaccion),
        estatus: 1,
      }

      // posicion++
      // console.log(data)
      // this.insertBach(idperfil, posicion)
      this.xAPI.funcion = environment.functions.INSERTAR_PERFIL_DETALLE
      this.xAPI.parametros = ''
      this.xAPI.valores = JSON.stringify(data)

      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          posicion++
          this.insertBach(idperfil, posicion)
        },
        (error) => {
          console.error("Data: ", error)
        }
      )
    }
  }

  async listarAcciones() {
    this.rowDataAcc = []
    this.xAPI.funcion = environment.functions.LISTAR_MENU_ACCIONES
    this.xAPI.parametros = this.menu[0].split("|")[0]
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowDataAcc = data.Cuerpo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  LimpiarMenu() {
    this.estatus = undefined
  }

  editarRol(row) {
    console.log(row.Rol.Menu)
    this.blApp = false
    this.desactivo = 'disabled'
    this.selRol(row.aplicacion)

    this.Perfil.nombre = row.nombre
    this.Perfil.descripcion = row.descripcion
    this.Perfil.estatus = row.estatus
    this.selRolDetalle(row)


    this.active = 2

  }


  eliminarRol(row) {
    console.log(row)
    Swal.fire({
      title: "Alerta",
      text: "¿Está seguro que desea eliminar perfil?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#C81D11",
      confirmButtonText: "Si, Aceptar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok(row.id);
      }
    });
  }


  ok(id: string) {
    this.xAPI.funcion = environment.functions.ELIMINAR_PERFIL
    this.xAPI.parametros = id
    this.xAPI.valores = ''
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.listarPerfiles()
        this.active = 1
      },
      err => {

      }
    )
  }


  // (Asumiendo que PermisoPadre es el tipo de elemento en dataRolDetalles)
  generarMenuSeleccionado(menuCompleto: MenuItem[]): MenuItem[] {
    const menuSeleccionado: MenuItem[] = [];
    const permisoMap = new Map<string, number>(); // Key: 'Modulo-Menu-Accion' o 'Modulo-Menu-Privilegio', Value: estatus

    // 1. Mapear el estado de TODOS los checkboxes (Módulos, Sub-Menús y Privilegios)
    this.dataRolDetalles.forEach(padre => {
      const keyPadre = `${padre.modulo}-${padre.menu}`;
      permisoMap.set(keyPadre, padre.estatus);

      if (padre.children) {
        padre.children.forEach(subMenu => {
          const keySubMenu = `${keyPadre}-${subMenu.accion}`;
          permisoMap.set(keySubMenu, subMenu.estatus);

          if (subMenu.children) {
            subMenu.children.forEach(privilegio => {
              // La clave para un privilegio es Modulo-Menu-SubMenu-Privilegio
              const keyPrivilegio = `${keySubMenu}-${privilegio.accion}`;
              permisoMap.set(keyPrivilegio, privilegio.estatus);
            });
          }
        });
      }
    });

    // 2. Recorrer el Menú Completo (la plantilla original) y construir el resultado
    menuCompleto.forEach(padreMenu => {
      const subMenuFinal: SubMenu[] = [];
      let padreDebeSerIncluido = false;

      padreMenu.SubMenu.forEach(subMenuOriginal => {
        const keySubMenu = `${padreMenu.descripcion}-${padreMenu.nombre}-${subMenuOriginal.nombre}`;
        const subMenuEstaSeleccionado = permisoMap.get(keySubMenu) === 1;

        // Filtrar los privilegios de este submenú, incluyendo solo los seleccionados
        const privilegiosSeleccionados = (subMenuOriginal.Privilegios || []).filter(priv => {
          const keyPrivilegio = `${keySubMenu}-${priv.descripcion}`;
          return permisoMap.get(keyPrivilegio) === 1;
        });

        // Un submenú se incluye si está explícitamente marcado O si tiene al menos un privilegio seleccionado
        if (subMenuEstaSeleccionado || privilegiosSeleccionados.length > 0) {
          padreDebeSerIncluido = true;
          // Clonamos el submenú y le asignamos solo los privilegios filtrados
          const nuevoSubMenu = { ...subMenuOriginal, Privilegios: privilegiosSeleccionados };
          subMenuFinal.push(nuevoSubMenu);
        }
      });

      // El menú padre se incluye si tiene al menos un submenú válido
      if (padreDebeSerIncluido) {
        menuSeleccionado.push({
          ...padreMenu,
          SubMenu: subMenuFinal
        });
      }
    });

    return menuSeleccionado;
  }

  guardarPerfiles() {

    if (
      this.Perfil.nombre == "" ||
      this.Perfil.aplicacion == undefined
    ) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "Debe verificar los campos",
        3000
      )
      return false
    }

    let mnu = this.aplicacion.Rol.Menu
    this.perfilSave.nombre = this.Perfil.nombre
    this.perfilSave.descripcion = this.Perfil.descripcion
    this.perfilSave.estatus = this.Perfil.estatus
    this.perfilSave.aplicacion = this.aplicacion.id
    this.perfilSave.version = this.aplicacion.version
    this.perfilSave.llave = this.aplicacion.autor

    let id = Md5.hashAsciiStr(btoa(`${this.aplicacion.nombre}${this.aplicacion.version}${this.aplicacion.autor}${this.Perfil.nombre}`))
    this.perfilSave.id = id



    const menuFinal = this.generarMenuSeleccionado(mnu);


    this.perfilSave.Rol.descripcion = this.Perfil.descripcion
    this.perfilSave.Rol.Menu = menuFinal

    console.log(this.perfilSave)



    var obj = {
      coleccion: "sys-profile",
      objeto: this.perfilSave,
      donde: JSON.stringify({ id: id }),
      driver: "MGDBA",
      upsert: true,
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.utilservice.AlertMini(
          "top-end",
          "success",
          `Tu perfil se ha registrado: ${data.UpsertedID}`,
          3000
        )
        this.active = 1
        this.dataRol = []
        this.dataRolDetalles = []
        this.dataPlana = []
        this.dataJerarquica = []
        this.xrol = ''
        this.Perfil.nombre = ''
        this.Perfil.descripcion = ''
        this.listarPerfiles()
      },
      (error) => {
        this.utilservice.AlertMini(
          "top-end",
          "error",
          "Error al Guardadar los Datos",
          3000
        )
      }
    )


  }




  // -----------------------------------------------------------
  // Función que actualiza el estatus (sin mutar el arreglo de origen)
  // -----------------------------------------------------------

  updateMenuEstatusOnly(
    sourceArray: PermisoPadre[],
    updateArray: MenuItem[]
  ): PermisoPadre[] {
    // 1. Crear un mapa para búsquedas rápidas de menús principales
    const updateMap = new Map<string, MenuItem>();
    updateArray.forEach(item => {
      updateMap.set(item.nombre, item);
    });

    // 2. Usamos .map() para devolver un nuevo arreglo (inmutabilidad)
    const updatedArray = sourceArray.map(menuItem => {
      const updateData = updateMap.get(menuItem.menu);

      if (updateData) {
        // Coincidencia de Nivel Superior: 'menu' (origen) con 'nombre' (fuente)

        // Creamos un nuevo objeto (newMenuItem) a partir del original, actualizando 'estatus'.
        let newMenuItem: PermisoPadre = {
          ...menuItem,
          estatus: 1, // 🎯 ACT: estatus a 1
          // Creamos una nueva copia de 'children' para el siguiente paso (profunda inmutabilidad)
          children: menuItem.children.map(child => ({ ...child })),
        };

        // 3. Actualizar los Submenús (Children)
        if (newMenuItem.children.length > 0 && updateData.SubMenu.length > 0) {
          // Mapa rápido para los submenús de la data de actualización
          const subUpdateMap = new Map<string, MenuItem["SubMenu"][0]>();
          updateData.SubMenu.forEach(subItem => {
            subUpdateMap.set(subItem.nombre, subItem);
          });

          // Recorremos los children y creamos un nuevo arreglo de children.
          newMenuItem.children = newMenuItem.children.map(childItem => {
            const subUpdateData = subUpdateMap.get(childItem.accion);

            if (!subUpdateData) {
              return childItem; // No hay coincidencia en el submenú, devolver el original
            }

            // Coincidencia de Nivel 2 (SubMenú) encontrada. Ahora actualizamos sus privilegios.
            let newChildItem = { ...childItem, estatus: 1 };

            // 4. Actualizar los Privilegios (Nivel 3)
            if (newChildItem.children && newChildItem.children.length > 0 && subUpdateData.Privilegios && subUpdateData.Privilegios.length > 0) {
              const privUpdateMap = new Map<string, any>();
              subUpdateData.Privilegios.forEach(priv => {
                privUpdateMap.set(priv.descripcion, priv);
              });

              newChildItem.children = newChildItem.children.map(privilegioItem => {
                if (privUpdateMap.has(privilegioItem.accion)) {
                  // Coincidencia de Nivel 3 (Privilegio) encontrada.
                  return { ...privilegioItem, estatus: 1 }; // 🎯 ACT: estatus a 1 en el privilegio
                }
                return privilegioItem;
              });
            }

            return newChildItem;
          });
        }

        return newMenuItem;
      }

      // Si no hay data de actualización, devolvemos el objeto original (o una copia si se requiere inmutabilidad profunda)
      // Devolvemos el original ya que no hay cambios en sus propiedades.
      return menuItem;
    });

    return updatedArray;
  }


}
