import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms"
import { NgbModal, NgbModalConfig, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { ApiService, IAPICore } from "@services/apicore/api.service"
import { IPerfil, Privilegios } from "@services/seguridad/rol.service"
import { UtilService } from "@services/util/util.service"
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
  NgxDatatableModule,
} from "@swimlane/ngx-datatable"
import { environment } from "environments/environment"
import Swal from "sweetalert2"
import { Md5 } from "ts-md5"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgSelectModule } from "@ng-select/ng-select"
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component"
import { CoreDirectivesModule } from "@core/directives/directives"
import { CorePipesModule } from "@core/pipes/pipes.module"




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
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgxDatatableModule,
        NgSelectModule,
        ContentHeaderComponent,
        CoreDirectivesModule,
        CorePipesModule,
    ]
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

  public contentHeader: object

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  }

  public SelectionType = SelectionType
  basicSelectedOptionCtrl = new FormControl(10)
  perfilAplicacionCtrl = new FormControl('')
  xaplicacionCtrl = new FormControl({value: '', disabled: true})
  rolCtrl = new FormControl('')
  xrolCtrl = new FormControl({value: '', disabled: true})
  perfilNombreCtrl = new FormControl('')
  perfilDescripcionCtrl = new FormControl('')
  searchValueCtrl = new FormControl('')

  public selectedStatusFilter: string = 'all'; // 'all' | 'activos' | 'inactivos'

  get totalPerfiles(): number {
    return this.tempPerfil ? this.tempPerfil.length : 0;
  }

  get totalActivos(): number {
    return this.tempPerfil ? this.tempPerfil.filter(p => p.estatus == 1 || p.estatus === true || p.estatus === '1').length : 0;
  }

  get totalInactivos(): number {
    return this.tempPerfil ? this.tempPerfil.filter(p => p.estatus == 0 || p.estatus === false || p.estatus === '0').length : 0;
  }

  setStatusFilter(filter: string) {
    this.selectedStatusFilter = filter;
    this.applyCombinedFilters();
  }

  clearSearch() {
    this.searchValueCtrl.setValue('');
    this.applyCombinedFilters();
  }

  verTodos() {
    this.searchValueCtrl.setValue('');
    this.selectedStatusFilter = 'all';
    this.applyCombinedFilters();
  }

  recargar() {
    this.listarPerfiles();
  }

  applyCombinedFilters() {
    const val = (this.searchValueCtrl.value || '').toLowerCase().trim();
    const statusFilter = this.selectedStatusFilter;

    const filtered = (this.tempPerfil || []).filter(d => {
      // 1. Live search filter
      if (val) {
        const nombre = (d.nombre || '').toLowerCase();
        const descripcion = (d.descripcion || '').toLowerCase();
        const llave = (d.llave || '').toLowerCase();
        const matchesSearch =
          nombre.indexOf(val) !== -1 ||
          descripcion.indexOf(val) !== -1 ||
          llave.indexOf(val) !== -1;
        if (!matchesSearch) return false;
      }

      // 2. Status filter
      if (statusFilter === 'activos') {
        const isActive = d.estatus == 1 || d.estatus === true || d.estatus === '1';
        if (!isActive) return false;
      } else if (statusFilter === 'inactivos') {
        const isInactive = d.estatus == 0 || d.estatus === false || d.estatus === '0';
        if (!isInactive) return false;
      }

      return true;
    });

    this.lstPerfil = filtered;
    this.page = 1;
    if (this.table) {
      this.table.offset = 0;
    }
  }

  public basicSelectedOption: number = 10;
  public page: number = 1;

  public Perfil: IPerfil = {
    id: "",
    nombre: "",
    descripcion: "",
    estatus: 1,
    aplicacion: undefined,
  }

  public showDiv: boolean = false
  public isEditing: boolean = false
  public lstAplicaciones = []
  public lstRol = []
  public dataRolDetalles: PermisoPadre[] = [];
  public dataRol: any[] = []
  public datamenu = []
  public rowData = []
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
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
  @ViewChild('navWithIcons') navWithIcons: any
  @ViewChild('tablePermissions') tablePermissions: any


  public ColumnMode = ColumnMode
  public chkBoxSelected = []
  public lstPerfil = []
  public tempPerfil = []
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
    private cdr: ChangeDetectorRef,
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

    this.perfilNombreCtrl.valueChanges.subscribe(val =>
      this.Perfil.nombre = val as string
    )
    this.perfilDescripcionCtrl.valueChanges.subscribe(val =>
      this.Perfil.descripcion = val as string
    )
    this.perfilAplicacionCtrl.valueChanges.subscribe(val => {
      if (val !== null && val !== undefined && val !== '') {
        this.Perfil.aplicacion = Number(val);
        this.selRol(val as string);
        if (this.dataRol && this.dataRol.length === 1) {
          this.rolCtrl.setValue(this.dataRol[0].id);
        }
      } else {
        this.Perfil.aplicacion = undefined;
        this.dataRol = [];
        this.dataRolDetalles = [];
        this.rolCtrl.setValue(null, { emitEvent: false });
      }
    })
    this.rolCtrl.valueChanges.subscribe(val => {
      if (val !== null && val !== undefined && val !== '') {
        this.rol = val;
        this.selRolDetalle();
      }
    })

    this.CargarListaAplicaciones()
    this.listarPerfiles()
  }

  CargarListaAplicaciones() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACIONES
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.map((e) => {
          e.name = `${e.id}  (${e.nombre})`
          return e
        })
        this.cdr.detectChanges();
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
    this._isLoading.set(true);
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.CONSULTAR_LISTA_PERFILES
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.lstPerfil = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          data.sort((a, b) => {
            if ((a.aplicacion || '').localeCompare(b.aplicacion || '') === 0) {
              return (a.nombre || '').localeCompare(b.nombre || '');
            }
            return (a.aplicacion || '').localeCompare(b.aplicacion || '');
          });
          this.lstPerfil = data
          this.tempPerfil = data
          this.applyCombinedFilters();
        }
        this._isLoading.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error)
        this._isLoading.set(false);
        this.cdr.detectChanges();
      }
    )
  }

  nuevoPerfil(): void {
    this.isEditing = false;
    this.registrar = "Registrar nuevo perfil";
    this.blApp = true;
    this.desactivo = 'false';

    this.perfilNombreCtrl.setValue('', { emitEvent: false });
    this.perfilDescripcionCtrl.setValue('', { emitEvent: false });
    this.perfilAplicacionCtrl.setValue(null, { emitEvent: false });
    this.xaplicacionCtrl.setValue('', { emitEvent: false });
    this.xrolCtrl.setValue('', { emitEvent: false });
    this.rolCtrl.setValue(null, { emitEvent: false });

    this.Perfil = {
      id: "",
      nombre: "",
      descripcion: "",
      estatus: 1,
      aplicacion: undefined,
    };
    this.aplicacion = undefined;

    this.dataRolDetalles = [];
    this.dataRol = [];
    this.dataPlana = [];
    this.dataJerarquica = [];
    this.padresMap = new Map<string, PermisoPadre>();
    this.SelectOn = [];
    this.lista = [];

    this.active = 2;
    if (this.navWithIcons) {
      this.navWithIcons.select(2);
    }
    this.cdr.detectChanges();
  }

  selTab(e: any) {
    const tabId = Number(e);
    if (tabId === 1) {
      this.isEditing = false;
      this.registrar = "Registrar nuevo perfil";
    } else if (tabId === 2) {
      if (!this.isEditing) {
        this.nuevoPerfil();
      }
    }
  }

  filterUpdate(event) {
    this.applyCombinedFilters();
  }

  onSelect({ selected }) {
    console.log(selected)
    this.SelectOn = selected
  }

  selRol(event: any, rowFallback: any = null): void {
    this.dataRol = [];
    this.dataRolDetalles = [];
    this.dataPlana = [];
    this.dataJerarquica = [];
    this.xrolCtrl.setValue('');
    if (!this.isEditing) {
      this.perfilNombreCtrl.setValue('');
      this.perfilDescripcionCtrl.setValue('');
    }

    this.aplicacion = this.obtenerAplicacion(event);

    if (!this.aplicacion) {
      const fallbackRol = rowFallback?.Rol || { descripcion: 'Sistema', Menu: [] };
      this.aplicacion = {
        id: event || (rowFallback ? rowFallback.aplicacion : ''),
        nombre: (rowFallback && rowFallback.aplicacion) ? rowFallback.aplicacion : 'Aplicación',
        autor: '',
        comentario: '',
        version: (rowFallback && rowFallback.version) ? rowFallback.version : '1.0',
        Rol: fallbackRol
      };
    }

    let rol = {
      "app": event,
      "estatus": "1",
      "id": event,
      "llave": this.aplicacion?.autor || '',
      "observacion": this.aplicacion?.comentario || '',
      "name": this.aplicacion?.Rol?.descripcion || 'Sistema'
    };
    this.xrolCtrl.setValue(this.aplicacion?.Rol?.descripcion || 'Sistema');
    this.xaplicacionCtrl.setValue(this.aplicacion?.nombre || '');
    this.dataRol.push(rol);
  }

  selRolDetalle(row: any = null): void {
    this.dataRolDetalles = [];
    this.dataPlana = [];
    this.dataJerarquica = [];
    let lst = [];

    const menuList = this.aplicacion?.Rol?.Menu || row?.Rol?.Menu || [];
    if (!menuList || menuList.length === 0) {
      console.warn('No se encontraron menús en la aplicación/rol');
      return;
    }

    menuList.forEach(mnu => {
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
      };
      lst.push(obj);
      if (mnu.SubMenu && mnu.SubMenu.length > 0) {
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
            "estatus": 0,
            "Privilegios": sub.Privilegios
          };
          lst.push(obj);
        });
      }
    });

    this.dataPlana = lst;
    this.convertirDataPlana();

    if (row != null && row.Rol && row.Rol.Menu) {
      this.dataRolDetalles = this.updateMenuEstatusOnly(this.dataJerarquica, row.Rol.Menu);
    } else {
      this.dataRolDetalles = this.dataJerarquica;
    }

    // Recalcular el estado de todos los padres después de cargar los datos
    this.recalcularTodosLosPadres();

    // SNAPSHOT INICIAL
    this.initialPerfilSnapshot = {
      nombre: this.Perfil.nombre,
      descripcion: this.Perfil.descripcion
    };
    this.initialPermissionsHash = this.getPermissionsHash();
    return;
  }

  // Variables para control de cambios
  public initialPerfilSnapshot: any = {};
  public initialPermissionsHash: string = '';

  /**
   * Genera un string único basado en los estatus de todos los permisos.
   * Se usa para detectar si hubo cambios en la selección.
   */
  getPermissionsHash(): string {
    let hash = '';
    if (this.dataRolDetalles) {
      this.dataRolDetalles.forEach(mod => {
        hash += `${mod.modulo}:${mod.estatus}|`;
        if (mod.children) {
          mod.children.forEach(menu => {
            hash += `${menu.accion}:${menu.estatus}|`;
            if (menu.children) {
              menu.children.forEach(priv => {
                hash += `${priv.accion}:${priv.estatus}|`;
              });
            }
          });
        }
      });
    }
    return hash;
  }

  /**
   * Verifica si el perfil ha sufrido cambios con respecto a su carga inicial.
   * Compara nombre, descripción y el hash de permisos.
   */
  hasProfileChanged(): boolean {
    // 1. Verificar Nombre y Descripción
    if (this.Perfil.nombre !== this.initialPerfilSnapshot.nombre) return true;
    if (this.Perfil.descripcion !== this.initialPerfilSnapshot.descripcion) return true;

    // 2. Verificar Hash de Permisos
    const currentHash = this.getPermissionsHash();
    if (currentHash !== this.initialPermissionsHash) return true;

    return false;
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
   * Recorre recursivamente un nodo y todos sus descendientes
   * (SubMenus, Privilegios) asignando el nuevo estatus (1 o 0).
   */
  private setStatusCascade(node: any, status: number): void {
    if (!node) return;
    node.estatus = status;
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => this.setStatusCascade(child, status));
    }
    if (node.Privilegios && Array.isArray(node.Privilegios)) {
      node.Privilegios.forEach((priv: any) => this.setStatusCascade(priv, status));
    }
  }

  isMasterChecked(): boolean {
    if (!this.dataRolDetalles || this.dataRolDetalles.length === 0) return false;
    return this.dataRolDetalles.every(p => p.estatus === 1);
  }

  isMasterIndeterminate(): boolean {
    if (!this.dataRolDetalles || this.dataRolDetalles.length === 0) return false;
    const hasAny = this.dataRolDetalles.some(p => p.estatus === 1 || this.hasSelectedChildren(p));
    return hasAny && !this.isMasterChecked();
  }

  /**
   * Maneja el checkbox maestro de la cabecera. Recorre TODA la lista
   * de permisos y actualiza en cascada padres, hijos y nietos.
   */
  onMasterCheckboxChange(event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;

    this.dataRolDetalles.forEach(padre => {
      this.setStatusCascade(padre, newStatus);
    });

    this.recalcularTodosLosPadres();
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  onParentCheckboxChange(row: PermisoPadre, event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;

    this.setStatusCascade(row, newStatus);
    this.recalcularTodosLosPadres();
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Maneja el checkbox del SubMenú (Nivel 2).
   * Actualiza sus Privilegios (Nivel 3) y recalcula el estado de la jerarquía.
   */
  onSubMenuCheckboxChange(subMenu: SubMenu, event: any): void {
    const isChecked = event.target.checked;
    const newStatus = isChecked ? 1 : 0;

    this.setStatusCascade(subMenu, newStatus);
    this.recalcularTodosLosPadres();
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  /**
   * Maneja el checkbox del Privilegio (Nivel 3).
   * Recalcula el estado del SubMenú (Nivel 2) y del Menú (Nivel 1).
   */
  onPrivilegeCheckboxChange(privilegio: Privilegio, subMenu: SubMenu, event: any): void {
    privilegio.estatus = event.target.checked ? 1 : 0;
    this.recalcularTodosLosPadres();
    this.dataRolDetalles = [...this.dataRolDetalles];
  }

  recalcularEstadoPadre(menuNombre: string): void {
    this.recalcularTodosLosPadres();
  }

  /**
   * Recalcula el estado de TODOS los padres y submenús en dataRolDetalles.
   * Lógica bottom-up: primero SubMenús a partir de Privilegios, luego Padres a partir de SubMenús.
   */
  recalcularTodosLosPadres(): void {
    if (!this.dataRolDetalles || this.dataRolDetalles.length === 0) {
      return;
    }

    this.dataRolDetalles.forEach(parent => {
      if (parent.children && parent.children.length > 0) {
        // 1. Recalcular cada SubMenu (Nivel 2) basado en sus Privilegios (Nivel 3)
        parent.children.forEach(subMenu => {
          if (subMenu.children && subMenu.children.length > 0) {
            const todosPrivilegios = subMenu.children.every(priv => priv.estatus === 1);
            const algunPrivilegio = subMenu.children.some(priv => priv.estatus === 1);

            if (todosPrivilegios) {
              subMenu.estatus = 1;
            } else if (!algunPrivilegio) {
              subMenu.estatus = 0;
            } else {
              subMenu.estatus = 0; // Parcial
            }
          }
        });

        // 2. Recalcular el Padre (Nivel 1) basado en SubMenus y Privilegios
        const todosSubMenusSeleccionados = parent.children.every(subMenu => {
          if (subMenu.children && subMenu.children.length > 0) {
            return subMenu.estatus === 1 && subMenu.children.every(priv => priv.estatus === 1);
          }
          return subMenu.estatus === 1;
        });

        const algunElementoSeleccionado = parent.children.some(subMenu => {
          if (subMenu.estatus === 1) return true;
          if (subMenu.children && subMenu.children.length > 0) {
            return subMenu.children.some(priv => priv.estatus === 1);
          }
          return false;
        });

        if (todosSubMenusSeleccionados) {
          parent.estatus = 1;
        } else if (!algunElementoSeleccionado) {
          parent.estatus = 0;
        } else {
          parent.estatus = 0; // Parcial
        }
      }
    });
  }

  /**
   * Verifica si un elemento padre tiene al menos un hijo seleccionado
   * pero no todos. Útil para mostrar un indicador visual (guion o badge).
   * @param row El elemento padre a verificar
   * @returns true si tiene algunos hijos seleccionados pero no todos
   */
  hasSelectedChildren(row: PermisoPadre | SubMenu): boolean {
    if (!row.children || row.children.length === 0) {
      return false;
    }

    // 1. Verificar si hay algún hijo directo seleccionado
    const someChildrenSelected = row.children.some(child => child.estatus === 1);

    // 2. Verificar si hay algún nieto (privilegio) seleccionado
    const someGrandchildrenSelected = row.children.some(child => {
      if ('children' in child && child.children && child.children.length > 0) {
        return (child as SubMenu).children.some(p => p.estatus === 1);
      }
      return false;
    });

    // Retorna true si hay CUALQUIER selección (hijos o nietos)
    // El *ngIf en el HTML se encargará de ocultar esto si el padre está totalmente seleccionado (estatus === 1)
    return someChildrenSelected || someGrandchildrenSelected;
  }

  /**
   * Verifica si un SubMenu tiene al menos un privilegio seleccionado
   * @param subMenu El submenu a verificar
   * @returns true si tiene al menos un privilegio seleccionado
   */
  hasSelectedPrivileges(subMenu: SubMenu): boolean {
    if (!subMenu.children || subMenu.children.length === 0) {
      return false;
    }

    return subMenu.children.some(privilegio => privilegio.estatus === 1);
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

  Cancelar() {
    this.isEditing = false;
    this.registrar = "Registrar nuevo perfil";
    this.active = 1;
    if (this.navWithIcons) {
      this.navWithIcons.select(1);
    }
    this.selTab(1);
    this.cdr.detectChanges();
  }

  editarRol(row: any) {
    Swal.fire({
      title: "Modificar Perfil",
      text: `¿Está seguro que desea editar el perfil "${row.nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, Editar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary mr-1'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          this.isEditing = true;
          this.blApp = false;
          this.desactivo = 'disabled';
          this.registrar = "Modificar perfil";

          this.selRol(row.aplicacion, row);

          this.perfilNombreCtrl.setValue(row.nombre, { emitEvent: false });
          this.perfilDescripcionCtrl.setValue(row.descripcion, { emitEvent: false });
          this.perfilAplicacionCtrl.setValue(this.aplicacion?.id || row.aplicacion, { emitEvent: false });

          this.Perfil.id = row.id;
          this.Perfil.nombre = row.nombre;
          this.Perfil.descripcion = row.descripcion;
          this.Perfil.estatus = row.estatus;
          this.Perfil.aplicacion = row.aplicacion;

          this.selRolDetalle(row);
        } catch (err) {
          console.error('Error al editar rol:', err);
        } finally {
          this.active = 2;
          if (this.navWithIcons) {
            this.navWithIcons.select(2);
          }
          this.cdr.detectChanges();
        }
      }
    });
  }


  eliminarRol(row) {
    Swal.fire({
      title: "Eliminar Perfil",
      text: `¿Está seguro que desea eliminar el perfil "${row.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger mr-1'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok(row);
      }
    });
  }


  ok(row) {

    this.xAPI.funcion = environment.functions.CONSULTAR_PERFILES_ACTIVOS
    this.xAPI.parametros = `${row.nombre},${row.aplicacion}`
    this.xAPI.valores = ''
    console.log(this.xAPI.parametros)
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        if (data == null) {
          this.deleteAll(row.id)
        } else {
          Swal.fire({
            title: "Advertencia",
            text: `No se puede eliminar el perfil, existen (${data.length}) usuarios creados con este perfil.`,
            icon: "info",
            showCancelButton: false,
            confirmButtonColor: "#567b9eff",
            confirmButtonText: "Ok",
          })
        }
      },
      err => {

      }
    )


  }

  deleteAll(id: string) {
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
    const permisoMap = new Map<string, number>();

    this.dataRolDetalles.forEach(padre => {
      const keyPadre = `${padre.modulo}-${padre.menu}`;
      permisoMap.set(keyPadre, padre.estatus);

      if (padre.children) {
        padre.children.forEach(subMenu => {
          const keySubMenu = `${keyPadre}-${subMenu.accion}`;
          permisoMap.set(keySubMenu, subMenu.estatus);

          if (subMenu.children) {
            subMenu.children.forEach(privilegio => {
              const keyPrivilegio = `${keySubMenu}-${privilegio.accion}`;
              permisoMap.set(keyPrivilegio, privilegio.estatus);
            });
          }
        });
      }
    });

    // 2. Recorrer el Menú Completo (la plantilla original) y construir el resultado
    menuCompleto.forEach(padreMenu => {
      // La clave para el menú padre (Nivel 1)
      const keyPadre = `${padreMenu.descripcion}-${padreMenu.nombre}`;
      const padreEstaSeleccionadoDirectamente = permisoMap.get(keyPadre) === 1;

      const subMenuFinal: SubMenu[] = [];
      let algunHijoEstaSeleccionado = false;

      padreMenu.SubMenu.forEach(subMenuOriginal => {
        const keySubMenu = `${padreMenu.descripcion}-${padreMenu.nombre}-${subMenuOriginal.nombre}`;
        const subMenuEstaSeleccionado = permisoMap.get(keySubMenu) === 1;

        const privilegiosSeleccionados = (subMenuOriginal.Privilegios || []).filter(priv => {
          const keyPrivilegio = `${keySubMenu}-${priv.descripcion}`;
          return permisoMap.get(keyPrivilegio) === 1;
        });

        // El submenú se incluye si está marcado directamente O si tiene al menos un privilegio marcado.
        if (subMenuEstaSeleccionado || privilegiosSeleccionados.length > 0) {
          algunHijoEstaSeleccionado = true;
          const nuevoSubMenu = { ...subMenuOriginal, Privilegios: privilegiosSeleccionados };
          subMenuFinal.push(nuevoSubMenu);
        }
      });

      // El menú padre se incluye si está marcado directamente O si alguno de sus hijos fue incluido.
      if (padreEstaSeleccionadoDirectamente || algunHijoEstaSeleccionado) {
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
      this.perfilNombreCtrl.value == "" ||
      this.perfilAplicacionCtrl.value == undefined
    ) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "Debe verificar los campos",
        3000
      )
      return false
    }

    let id = ""
    // console.log(this.Perfil)
    // console.log(this.aplicacion)
    let mnu = this.aplicacion.Rol.Menu
    this.perfilSave.nombre = this.Perfil.nombre
    this.perfilSave.descripcion = this.Perfil.descripcion
    this.perfilSave.estatus = this.Perfil.estatus
    this.perfilSave.aplicacion = this.aplicacion.id
    this.perfilSave.version = this.aplicacion.version
    this.perfilSave.llave = this.aplicacion.nombre


    if (this.Perfil.id === "") {
      id = Md5.hashAsciiStr(btoa(`${this.aplicacion.nombre}${this.aplicacion.version}${this.aplicacion.autor}${this.Perfil.nombre}`))
      this.perfilSave.id = id
    } else {
      id = this.Perfil.id
      this.perfilSave.id = this.Perfil.id
    }


    const menuFinal = this.generarMenuSeleccionado(mnu);


    this.perfilSave.Rol.descripcion = this.Perfil.descripcion
    this.perfilSave.Rol.Menu = menuFinal

    var obj = {
      coleccion: environment.colecciones.SYS_PROFILE,
      objeto: this.perfilSave,
      donde: JSON.stringify({ id: id }),
      driver: environment.driver.PRINCIPAL,
      upsert: true,
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {

        if (data.UpsertedID != null) {
          this.utilservice.AlertMini(
            "top-end",
            "success",
            `Tu perfil se ha registrado correctamente`,
            3000
          )

          this.limpiarPerfil()

        } else {

          this.updateAllUserProfile()
        }
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


  updateAllUserProfile() {

    this.xAPI.funcion = environment.functions.UPDATE_ALL_USER_PROFILE
    this.xAPI.parametros = `${this.perfilSave.id}array##${JSON.stringify(this.perfilSave.Rol.Menu)}`
    this.xAPI.valores = ``

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {

        this.utilservice.AlertMini(
          "top-end",
          "success",
          "Perfil actualizado correctamente",
          3000
        )

        this.limpiarPerfil()

      },
      (error) => {
        console.log(error)
      }
    )
  }

  limpiarPerfil() {
    this.isEditing = false;
    this.registrar = "Registrar nuevo perfil";
    this.active = 1;
    if (this.navWithIcons) {
      this.navWithIcons.select(1);
    }
    this.dataRol = [];
    this.dataRolDetalles = [];
    this.dataPlana = [];
    this.dataJerarquica = [];
    this.xrol = '';
    this.Perfil.id = '';
    this.perfilNombreCtrl.setValue('');
    this.perfilDescripcionCtrl.setValue('');
    this.rolCtrl.setValue('');
    if (this.aplicacion?.id) {
      this.selRol(this.aplicacion.id);
    }

    this.listarPerfiles();
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


  /**
   * Exportar Perfil A PDF (Versión Premium Final)
   */
  exportarPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Titulo Principal - Azul Suave
    doc.setFontSize(26);
    doc.setTextColor(100, 181, 246); // Blue 300 (Pastel)
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE PERFIL', pageWidth / 2, 80, { align: 'center' });

    // Línea Decorativa Sutil
    doc.setDrawColor(224, 224, 224); // Grey 300
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    // Subtítulo (Nombre del Perfil)
    doc.setFontSize(18);
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text((this.Perfil.nombre || 'Perfil Sin Nombre').toUpperCase(), pageWidth / 2, 100, { align: 'center' });

    // Detalles Centrados
    doc.setFontSize(12);
    doc.setTextColor(117, 117, 117); // Grey 600
    doc.text(`Aplicación: ${this.xaplicacion || 'N/A'}`, pageWidth / 2, 115, { align: 'center' });
    doc.text(`Rol Asignado: ${this.xrol || 'N/A'}`, pageWidth / 2, 122, { align: 'center' });

    // Descripción en itálica suave
    if (this.Perfil.descripcion) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(158, 158, 158); // Grey 500
      const splitDesc = doc.splitTextToSize(`"${this.Perfil.descripcion}"`, pageWidth - 100);
      doc.text(splitDesc, pageWidth / 2, 140, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setTextColor(189, 189, 189); // Grey 400
    doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });


    // ==========================================
    // PAGINA 2+: TABLA
    // ==========================================
    doc.addPage();

    // Encabezado P2
    doc.setFontSize(14);
    doc.setTextColor(100, 181, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Mapa de Permisos', 14, 20);

    const tableData: any[][] = [];
    let lastModule = '';
    let lastMenu = '';

    const rowConfig: any[] = [];

    this.dataRolDetalles.forEach(modulo => {
      const isNewModule = modulo.modulo !== lastModule;
      if (isNewModule) {
        lastModule = modulo.modulo;
        lastMenu = '';
        // Módulo Header con ESTATUS
        tableData.push([
          modulo.modulo.toUpperCase(),
          '',
          '',
          modulo.estatus // Pasar estatus del módulo
        ]);
        rowConfig.push({ type: 'module' });
      }

      if (modulo.children && modulo.children.length > 0) {
        modulo.children.forEach(menu => {
          const isNewMenu = menu.accion !== lastMenu;
          if (isNewMenu) {
            lastMenu = menu.accion;
          }

          if (menu.children && menu.children.length > 0) {
            menu.children.forEach((privilegio, index) => {
              // Para la primera fila del menú, podríamos querer mostrar el status del menú padre si se desea
              // Pero aquí listamos privilegios.
              // El usuario pidió "en los menu padre tambien podemos poner el check".
              // Esto implica que la fila "Menu" (que agrupamos) debería tener su propio status?
              // Actualmente NO tenemos una fila dedicada solo al menú si tiene hijos, los hijos "ocupan" las filas.
              // Para cumplir el deseo, mostraré el menú con su check en la primera fila del grupo.

              // Hack: Usaremos la primera fila del privilegio para "representar" al menú también visualmente?
              // O mejor: Insertamos una fila explicita para el Menú si es nuevo.

              // Si es un MENÚ NUEVO, agregamos una fila de "Cabecera de Menú" que tenga el check del menú
              if (isNewMenu && index === 0) {
                // Fila de MENÚ PADRE (Solo si se quiere explicito)
                // El usuario dijo "en los menu padre tb".
                // Vamos a agregar una fila para el Menú si tiene hijos, antes de los hijos.
                tableData.push([
                  '',
                  menu.accion.toUpperCase(),
                  '(Grupo de Permisos)',
                  menu.estatus // Check del Menú Padre
                ]);
                rowConfig.push({ type: 'menu_header' });
              }

              tableData.push([
                '',
                '', // Menu vacío (ya lo mostramos en header o agrupado)
                privilegio.accion,
                privilegio.estatus
              ]);
              rowConfig.push({ type: 'privilege' });
            });
          } else {
            // Menu sin hijos (es un privilegio directo en sí mismo)
            tableData.push([
              '',
              menu.accion,
              '(Acceso General)',
              menu.estatus
            ]);
            // Tratamos como menu header o priv? Privilegio directo.
            rowConfig.push({ type: 'privilege', isDirectMenu: true });
          }
        });
      }
    });

    autoTable(doc, {
      startY: 25,
      head: [['MÓDULO', 'MENÚ', 'PRIVILEGIO', 'ESTATUS']],
      body: tableData,
      theme: 'grid',

      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97]
      },

      headStyles: {
        fillColor: [255, 255, 255], // White Header
        textColor: [100, 181, 246], // Blue Text
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0, // No borders on header
        lineColor: [255, 255, 255]
      },

      columnStyles: {
        0: { cellWidth: 0 },
        3: { cellWidth: 20, halign: 'center' }
      },

      didParseCell: (data) => {
        const rowIndex = data.row.index;
        const config = rowConfig[rowIndex];

        if (data.section === 'body') {
          // Estilo MÓDULO (Header Azul Muy Suave)
          if (config && config.type === 'module') {
            data.cell.styles.fillColor = [227, 242, 253]; // Light Blue 50
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [33, 150, 243];
            if (data.column.index === 0) data.cell.colSpan = 3; // Span solo primeras 3 columnas para dejar la 4ta (Estatus) libre para el check
          }

          // Estilo MENÚ PADRE (Header)
          if (config && config.type === 'menu_header') {
            data.cell.styles.fillColor = [255, 248, 225]; // Amber 50 (Pastel Yellow/Orange)
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [97, 97, 97];
            // Indentar visualmente el texto del menu
            if (data.column.index === 1) data.cell.styles.fontStyle = 'bold';
          }

          // Estilo PRIVILEGIO (Hijo)
          if (config && config.type === 'privilege') {
            // Fondo blanco puro
            data.cell.styles.fillColor = [255, 255, 255];
            if (data.column.index === 2) {
              // Indentacion visual en texto? No, ya esta en col 3
            }
          }

          // VACIIAR TEXTO ESTATUS (Para todos, incluidos módulos)
          if (data.column.index === 3) {
            data.cell.text = [];
          }
        }
        // Header Clean Line
        if (data.section === 'head') {
          // Border bottom blue
          // data.cell.styles.lineWidth = {bottom: 0.5};
          // data.cell.styles.lineColor = [100, 181, 246];
        }
      },

      didDrawCell: (data) => {
        // CHECKBOX PASTELES
        if (data.section === 'body' && data.column.index === 3) {
          const rowIndex = data.row.index;
          const config = rowConfig[rowIndex];

          // Ahora PERMITIMOS dibujar en modulos tambien
          // if (config && config.type === 'module') return false;

          const estatus = data.cell.raw as number;
          const dim = 4; // tamaño caja más pequeño y fino
          const cx = data.cell.x + (data.cell.width / 2) - (dim / 2);
          const cy = data.cell.y + (data.cell.height / 2) - (dim / 2);

          if (estatus === 1) {
            // Caja Verde Pastel Suave
            doc.setFillColor(165, 214, 167); // Green 200
            doc.setDrawColor(165, 214, 167);
            doc.roundedRect(cx, cy, dim, dim, 1, 1, 'FD');

            // Check Blanco Fino
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.6);
            doc.line(cx + 1, cy + 2, cx + 1.8, cy + 3);
            doc.line(cx + 1.8, cy + 3, cx + 3.2, cy + 1.2);
          } else {
            // Caja Gris Muy Suave
            doc.setDrawColor(224, 224, 224); // Grey 300
            doc.setFillColor(250, 250, 250); // Almost white
            doc.roundedRect(cx, cy, dim, dim, 1, 1, 'FD');
          }
        }
      }
    }); // End autoTable

    // Paginación Minimalist
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    const fileName = `Reporte_${this.Perfil.nombre || 'Perfil'}.pdf`.replace(/ /g, '_');
    const pdfDataUri = doc.output('datauristring');

    // Sandra Sandbox Bridge detection
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_PDF',
        payload: {
          fileName: fileName,
          data: pdfDataUri
        }
      }, '*');
    } else {
      // Direct browser download
      doc.save(fileName);
    }
  }

}
