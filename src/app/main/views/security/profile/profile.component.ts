import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap"
import { ApiService, IAPICore } from "@services/apicore/api.service"
import { IPerfil } from "@services/seguridad/rol.service"
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
  SubMenu: MenuItem[];
}


// 1. Interfaces para tipar tus datos
interface PermisoAccion {
  accion: string;
  menu: string;
  modulo: string;
  rol: string;
  xaccion: string | null;
  xmenu: string; // Usaremos '1' para seleccionado, '0' para no seleccionado
  xmodulo: string;
  xrol: string;
  estatus: number;
}

interface PermisoPadre extends PermisoAccion {
  children?: PermisoAccion[]; // Array de sub-acciones
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
  public dataRol = []
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
  public dataPlana: PermisoAccion[] = [];

  public dataJerarquica: PermisoPadre[] = [];
  public padresMap = new Map<string, PermisoPadre>();


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
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Seguridad",
            isLink: false,
          },
          {
            name: "Definir Rol",
            isLink: false,
          },
        ],
      },
    }
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
    this.dataRol.push(rol)


  }

  selRolDetalle(event: any): void {
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
            "estatus": 0
          }
          lst.push(obj)

        })
      }
    });

    this.dataPlana = lst
    this.convertirDataPlana()
    console.log(this.dataJerarquica)
    this.dataRolDetalles = this.dataJerarquica
    this.cd.detectChanges();
    return
  }

  convertirDataPlana() {
    this.dataPlana.forEach(item => {
      const key = `${item.modulo}-${item.menu}`; // Usamos Modulo y Menu como clave del grupo

      if (item.accion === '-') {
        // Es un elemento padre (el grupo)
        const padre: PermisoPadre = { ...item, children: [], isExpanded: false };
        this.padresMap.set(key, padre);
        this.dataJerarquica.push(padre);
      } else {
        // Es una acción (hijo)
        const padre = this.padresMap.get(key);
        if (padre) {
          padre.children!.push(item);
        }
        // Nota: Los elementos hijos que no tienen un padre '-' con la misma key se ignorarían o se tratarían como elementos de nivel superior si lo deseas.
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
  onParentCheckboxChange(row: any, event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;

    // 1. Actualizar el estado del Padre
    row.estatus = newStatus;

    // 2. Actualizar el estado de todos los Hijos (cascada)
    if (row.children) {
      row.children.forEach(child => {
        child.estatus = newStatus;
      });
    }

    // Opcional: Forzar la actualización de la tabla para que se refresque visualmente
    // Esto es crucial para que ngx-datatable reconozca el cambio de estado
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  // También verifica si onChildCheckboxChange está presente, ya que la necesitarás:
  onChildCheckboxChange(child: any, event: any): void {
    const isChecked = event.target.checked;
    child.estatus = isChecked ? 1 : 0;

    // Lógica para buscar el padre y actualizar su estado (opcional, pero recomendado)
    const key = `${child.modulo}-${child.menu}`;
    const parent = this.padresMap.get(key);

    if (parent) {
      const allChildrenChecked = parent.children!.every(c => c.estatus === 1);
      const newParentStatus = allChildrenChecked ? 1 : 0;

      if (parent.estatus !== newParentStatus) {
        parent.estatus = newParentStatus;
      }
    }

    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Recorre la estructura jerárquica y crea una lista plana 
   * solo con los elementos hijos (acciones) seleccionados.
   * @returns {PermisoAccion[]} Una lista de objetos PermisoAccion con estatus=1
   */
  listarPermisosSeleccionados(): PermisoAccion[] {
    const seleccionados: PermisoAccion[] = [];

    this.dataRolDetalles.forEach(padre => {
      let padreDebeSerIncluido = false;
      const hijosSeleccionados: PermisoAccion[] = [];

      // 1. Caso: El Padre no tiene hijos (es una acción final)
      if (!padre.children || padre.children.length === 0) {
        if (padre.estatus === 1) {
          seleccionados.push(padre);
        }
        return; // Pasar al siguiente padre
      }

      // 2. Caso: El Padre tiene hijos
      padre.children.forEach(hijo => {
        if (hijo.estatus === 1) {
          hijosSeleccionados.push(hijo);
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
          return el.xaccion == e.xaccion && el.xmenu == e.xmenu
        })
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
    this.xAPI.funcion = environment.functions.LISTAR_PERFIL_MENUS
    this.xAPI.parametros = row.id
    this.xAPI.valores = ''
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        let idAPP = ''
        this.registrar = "Editar Perfil"
        this.dataRolDetalles = data.Cuerpo.map((e) => {
          this.Perfil.descripcion = e.observacion
          this.Perfil.nombre = e.rol
          this.xaplicacion = e.app
          this.xrol = e.rol
          idAPP = e.idapp
          e.idmod = e.idmod
          e.modulo = e.modulo
          e.idmenu = e.idmenu
          e.menu = e.menu
          e.accid = e.accid
          e.accion = e.accion
          return e
        })
        this.lista = this.dataRolDetalles
        this.blApp = false
        this.Perfil.aplicacion = this.lstAplicaciones.find(
          (item) => item.id == idAPP
        ).name
        this.active = 2
      },
      (error) => {
        console.log(error)
      }
    )
  }


  eliminarRol(row) {
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

    // Mapeamos dataRolDetalles para fácil acceso a los estados de permiso
    const permisoMap = new Map<string, number>(); // Key: 'Modulo-Menu-Accion', Value: estatus

    this.dataRolDetalles.forEach(padre => {
      // 1. Guardar el estado del Padre (si 'accion' es '-')
      if (padre.accion === '-') {
        const keyPadre = `${padre.modulo}-${padre.menu}-`;
        permisoMap.set(keyPadre, padre.estatus);
      }

      // 2. Guardar el estado de los Hijos (acciones)
      if (padre.children) {
        padre.children.forEach(hijo => {
          const keyHijo = `${hijo.modulo}-${hijo.menu}-${hijo.accion}`;
          permisoMap.set(keyHijo, hijo.estatus);
        });
      }
    });

    // 3. Recorrer el Menú Completo (Plantilla) y Filtrar
    menuCompleto.forEach(padreMenu => {

      // Obtener el estado del Padre en la lista de permisos
      const keyPadre = `${padreMenu.descripcion}-${padreMenu.nombre}-`; // Usamos descripcion/nombre como Modulo/Menu
      let padreEstaSeleccionado = permisoMap.get(keyPadre) === 1;

      // Preparar el nuevo SubMenu
      const subMenuSeleccionado: MenuItem[] = [];

      // Recorrer los SubMenús (Hijos)
      padreMenu.SubMenu.forEach(hijoMenu => {
        const keyHijo = `${padreMenu.descripcion}-${padreMenu.nombre}-${hijoMenu.descripcion}`;

        // Si el hijo está seleccionado (estatus = 1 en la tabla de permisos)
        if (permisoMap.get(keyHijo) === 1) {
          subMenuSeleccionado.push(hijoMenu);
          padreEstaSeleccionado = true; // Asegurar que el padre se incluya si algún hijo se incluye
        }
      });

      // 4. Construir el nuevo Objeto Padre
      if (padreEstaSeleccionado || (padreMenu.SubMenu.length === 0 && permisoMap.get(keyPadre) === 1)) {
        // Clona el objeto padre del menú completo
        const nuevoPadre = { ...padreMenu };

        // Asigna el submenú filtrado
        nuevoPadre.SubMenu = subMenuSeleccionado;

        menuSeleccionado.push(nuevoPadre);
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
    // console.log(this.Perfil.nombre)
    this.perfilSave.nombre = this.Perfil.nombre
    this.perfilSave.descripcion = this.Perfil.descripcion
    this.perfilSave.estatus = this.Perfil.estatus
    this.perfilSave.aplicacion = this.aplicacion.id
    this.perfilSave.version = this.aplicacion.version
    this.perfilSave.llave = this.aplicacion.autor

    let id = Md5.hashAsciiStr(btoa(`${this.aplicacion.nombre}${this.aplicacion.version}${this.aplicacion.autor}${this.Perfil.nombre}`))
    this.perfilSave.id = id


    
      const menuFinal = this.generarMenuSeleccionado(mnu);

      console.log("Menú Final Seleccionado:", menuFinal);

      this.perfilSave.Rol.descripcion = this.Perfil.descripcion
      this.perfilSave.Rol.Menu = menuFinal

      // console.log(this.perfilSave)



      var obj = {
        coleccion: "sys-profile",
        objeto: this.perfilSave,
        donde: `{\"id\":\"${id}\"}`,
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



}
