import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { NgSelectModule } from '@ng-select/ng-select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as Feather from 'feather-icons';

// ============================================================================
// Interfaces del Esquema de Menú (MongoDB SYS_SCHEMA)
// ============================================================================

export interface IPrivilegioMenu {
  metodo: string;       // ej: 'agregar', 'editar', 'eliminar', 'escanear'
  descripcion: string;  // ej: 'Agregar', 'Editar'
  accion: string;       // ej: 'Agregar()', 'Editar()'
  directivas: string;   // ej: ''
}

export interface ISubMenuItem {
  url: string;          // ej: 'networks/communications'
  js: string;           // ej: ''
  descripcion: string;  // ej: 'Comunicaciones'
  icono: string;        // ej: 'hard-drive'
  nombre: string;       // ej: 'Comunicaciones'
  accion: string;       // ej: "CargarUrl('control', 'buzon')"
  clase: string;        // ej: 'item'
  color: string;        // ej: 'bg-c-green', 'bg-c-blue'
  Privilegios: IPrivilegioMenu[];
  isExpanded?: boolean; // Estado reactivo en UI
}

export interface IMenuItem {
  url: string;          // ej: '/principal', '/redes'
  js: string;
  icono: string;        // ej: 'home', 'server'
  descripcion: string;  // ej: 'Principal', 'Redes'
  nombre: string;       // ej: 'Principal', 'Redes'
  accion: string;
  clase: string;        // ej: 'item', 'collapsible'
  color: string;
  Privilegio: any[];
  SubMenu: ISubMenuItem[];
  isExpanded?: boolean; // Estado reactivo en UI
}

export interface IRolSchema {
  descripcion: string;  // ej: 'Consola Sistema'
  Menu: IMenuItem[];
}

export interface IAplicacionSchema {
  id: string;           // Clave primaria única (ej: 'App.Consola')
  nombre: string;       // ej: 'Aplicacion (Consola)'
  url: string;          // ej: 'http://localhost/consola'
  comentario: string;   // ej: 'Consola Sistema'
  version: string;      // ej: '2.0.0'
  autor: string;        // ej: 'Code-Epic Technologies'
  Rol: IRolSchema;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgSelectModule,
    NgxDatatableModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent,
  ],
})
export class MenuComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public contentHeader: object;
  public ColumnMode = ColumnMode;

  // Control de Tabs: 1 = Listado, 2 = Diseñador, 3 = Editor JSON
  public active: number = 1;

  // API Core para llamadas estándar
  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  // Estado reactivo de carga
  private _isLoading = signal<boolean>(false);
  get isLoading() {
    return this._isLoading();
  }

  // Listas de esquemas de aplicaciones
  public aplicacione: any[] = [];
  public lstEsquemas: any[] = [];
  public tempEsquemas: any[] = [];

  // Objeto principal del esquema actual en edición
  public aplicacion: IAplicacionSchema = this.crearEsquemaVacio();

  // Variables de compatibilidad para el patrón de guardado
  public xaplicacion: any = null;
  public xperfil: any = null;

  // Controles reactivos de búsqueda y paginación
  public searchFilterCtrl = new FormControl('');
  public basicSelectedOptionCtrl = new FormControl(10);
  public jsonEditorText: string = '';

  // Estados para modales de edición de nodos
  public modalTipo: 'menu' | 'submenu' | 'privilegio' = 'menu';
  public modalTitulo: string = '';
  public editMenuIndex: number = -1;
  public editSubMenuIndex: number = -1;
  public editPrivilegioIndex: number = -1;

  // Modelos temporales para los formularios de modal
  public tempMenu: IMenuItem = this.crearMenuVacio();
  public tempSubMenu: ISubMenuItem = this.crearSubMenuVacio();
  public tempPrivilegio: IPrivilegioMenu = this.crearPrivilegioVacio();

  // Opciones de tipo de menú con símbolos amigables (sin usar raw 'collapsible')
  public tiposMenuClase = [
    {
      id: 'collapsible',
      label: 'Desplegable (Con Submenús)',
      simbolo: '▾',
      icono: 'folder',
      badgeClass: 'badge-light-primary'
    },
    {
      id: 'item',
      label: 'Directo (Enlace Simple)',
      simbolo: '●',
      icono: 'link',
      badgeClass: 'badge-light-secondary'
    }
  ];

  // Paleta de colores con valores sutiles mate
  public coloresSugeridos = [
    { id: '', name: 'Neutro / Estándar', hex: '#8a99a8', bgClass: 'bg-light-secondary' },
    { id: 'bg-c-blue', name: 'Azul Pizarra', hex: '#48739e', bgClass: 'bg-c-blue' },
    { id: 'bg-c-green', name: 'Verde Salvia', hex: '#43936c', bgClass: 'bg-c-green' },
    { id: 'bg-c-yellow', name: 'Ámbar Suave', hex: '#c99642', bgClass: 'bg-c-yellow' },
    { id: 'bg-c-red', name: 'Rojo Teja', hex: '#bd5353', bgClass: 'bg-c-red' },
    { id: 'bg-c-pink', name: 'Rosa Empolvado', hex: '#b56d7b', bgClass: 'bg-c-pink' },
    { id: 'bg-c-purple', name: 'Lavanda Mate', hex: '#735f99', bgClass: 'bg-c-purple' },
  ];

  // Catálogo organizado de iconos Feather para el selector
  public iconosSugeridos: string[] = [
    'home', 'server', 'tool', 'layers', 'lock', 'navigation', 'archive',
    'life-buoy', 'settings', 'layout', 'hard-drive', 'link', 'align-justify',
    'edit-2', 'command', 'message-square', 'file-minus', 'package', 'key',
    'sliders', 'user-plus', 'users', 'shopping-bag', 'book-open', 'check-circle',
    'file-text', 'clock', 'message-circle', 'alert-circle', 'refresh-ccw',
    'box', 'globe', 'shield', 'database', 'cpu', 'activity', 'terminal',
    'folder', 'send', 'zap', 'bell', 'grid', 'clipboard'
  ];

  constructor(
    private apiService: ApiService,
    public utilservice: UtilService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Aplicaciones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Principal', isLink: true, link: '/home' },
          { name: 'Aplicaciones', isLink: false },
          { name: 'Definir Menú', isLink: false },
        ],
      },
    };

    // Suscripción al filtro de búsqueda en tiempo real
    this.searchFilterCtrl.valueChanges.subscribe((val) => {
      this.filterUpdate(val || '');
    });

    // Cargar la lista inicial de esquemas
    this.obtenerListaEsquemas();
  }

  // ============================================================================
  // Función para obtener Lista de Esquemas (Patrón solicitado)
  // ============================================================================

  obtenerListaEsquemas(id: string = '') {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_ESQUEMAS_APLICACIONES;
    this.xAPI.parametros = id;
    this.xAPI.valores = '';
    this.aplicacion = this.crearEsquemaVacio();
    this._isLoading.set(true);

    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        const rawItems = data?.Cuerpo || (Array.isArray(data) ? data : data ? [data] : []);
        this.aplicacione = rawItems.map((e) => {
          e.name = e.nomb || e.nombre || e.id;
          return e;
        });

        if (id && this.aplicacione.length > 0) {
          this.seleccionarEsquema(this.aplicacione[0]);
        } else {
          this.lstEsquemas = [...this.aplicacione];
          this.tempEsquemas = [...this.aplicacione];
        }
        this._isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al listar esquemas de aplicaciones:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Error al cargar esquemas', 3000);
        this._isLoading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================================
  // Filtrado y Navegación de Tabs
  // ============================================================================

  filterUpdate(val: string): void {
    const query = val.toLowerCase().trim();
    if (!query) {
      this.lstEsquemas = [...this.tempEsquemas];
    } else {
      this.lstEsquemas = this.tempEsquemas.filter((item) => {
        const id = (item.id || '').toLowerCase();
        const nombre = (item.nombre || item.name || '').toLowerCase();
        const comentario = (item.comentario || '').toLowerCase();
        const autor = (item.autor || '').toLowerCase();
        return (
          id.includes(query) ||
          nombre.includes(query) ||
          comentario.includes(query) ||
          autor.includes(query)
        );
      });
    }
    if (this.table) {
      this.table.offset = 0;
    }
  }

  selTab(tabId: number): void {
    this.active = tabId;
    if (tabId === 3) {
      this.sincronizarTextoJSON();
    }
    this.cdr.detectChanges();
  }

  // ============================================================================
  // Gestión de Esquema (Selección, Creación, Limpieza)
  // ============================================================================

  seleccionarEsquema(item: any): void {
    const clon = JSON.parse(JSON.stringify(item));
    this.aplicacion = {
      id: clon.id || '',
      nombre: clon.nombre || clon.name || '',
      url: clon.url || '',
      comentario: clon.comentario || '',
      version: clon.version || '1.0.0',
      autor: clon.autor || 'Code-Epic Technologies',
      Rol: {
        descripcion: clon.Rol?.descripcion || clon.nombre || 'Consola Sistema',
        Menu: Array.isArray(clon.Rol?.Menu) ? clon.Rol.Menu : [],
      },
    };

    if (!this.aplicacion.Rol.Menu) {
      this.aplicacion.Rol.Menu = [];
    }
    this.aplicacion.Rol.Menu.forEach((m) => {
      // Si el módulo no tiene submenús, NO se despliega al inicio (vista limpia y compacta)
      const tieneSubmenus = Array.isArray(m.SubMenu) && m.SubMenu.length > 0;
      m.isExpanded = tieneSubmenus && m.clase === 'collapsible';
      m.icono = this.sanitizarIcono(m.icono || (m as any).icon, 'layers');
      if (!m.SubMenu) m.SubMenu = [];
      if (!m.Privilegio) m.Privilegio = [];
      m.SubMenu.forEach((s) => {
        // Los submenús inician con sus acciones contraídas para no sobrecargar la vista
        s.isExpanded = false;
        s.icono = this.sanitizarIcono(s.icono || (s as any).icon, 'layout');
        if (!s.Privilegios) s.Privilegios = [];
      });
    });

    this.sincronizarTextoJSON();
    this.active = 2;
    this.utilservice.AlertMini(
      'top-end',
      'info',
      `Esquema "${this.aplicacion.nombre}" cargado en diseñador`,
      2500
    );
    this.cdr.detectChanges();
  }

  sanitizarIcono(icono: any, fallback: string = 'layers'): string {
    if (!icono || typeof icono !== 'string') return fallback;
    let clean = icono.trim().toLowerCase();
    clean = clean.replace(/^(feather-|icon-|fa-|ti-)/, '');
    if (clean === 'edit') clean = 'edit-2';
    if (!(Feather as any).icons || !(Feather as any).icons[clean]) {
      return fallback;
    }
    return clean;
  }

  nuevoEsquema(): void {
    this.aplicacion = this.crearEsquemaVacio();
    this.sincronizarTextoJSON();
    this.active = 2;
    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.aplicacion = this.crearEsquemaVacio();
    this.xaplicacion = null;
    this.xperfil = null;
    this.sincronizarTextoJSON();
    this.cdr.detectChanges();
  }

  // ============================================================================
  // Persistencia Mongo: Patrón Unificado con ExecColeccion (upsert: true)
  // ============================================================================

  ok(tipo: number): void {
    if (!this.aplicacion.id || !this.aplicacion.id.trim()) {
      this.utilservice.AlertMini(
        'top-end',
        'warning',
        'Debe indicar el Identificador (ID) de la Aplicación',
        3000
      );
      return;
    }

    if (!this.aplicacion.nombre || !this.aplicacion.nombre.trim()) {
      this.utilservice.AlertMini(
        'top-end',
        'warning',
        'Debe indicar el Nombre de la Aplicación',
        3000
      );
      return;
    }

    const fnx = {
      coleccion: environment.colecciones.SYS_SCHEMA,
      objeto: this.aplicacion,
      donde: JSON.stringify({ id: this.aplicacion.id }),
      driver: environment.driver.PRINCIPAL,
      upsert: true,
    };

    this._isLoading.set(true);
    this.apiService.ExecColeccion(fnx).subscribe({
      next: (data) => {
        this._isLoading.set(false);
        this.utilservice.AlertMini(
          'top-end',
          'success',
          'Esquema de Menú guardado exitosamente en Mongo',
          3000
        );

        if (tipo === 2) {
          this.xaplicacion = null;
          this.xperfil = null;
          this.active = 1;
        }

        this.obtenerListaEsquemas();
      },
      error: (error) => {
        this._isLoading.set(false);
        console.error('Error al guardar esquema en Mongo:', error);
        this.utilservice.AlertMini(
          'top-end',
          'error',
          'Error al Guardar los Datos',
          3000
        );
      },
    });
  }

  // ============================================================================
  // Operaciones del Árbol Jerárquico: Nivel 1 (Menú Principal / Módulo)
  // ============================================================================

  abrirModalMenu(content: TemplateRef<any>, index: number = -1): void {
    this.modalTipo = 'menu';
    this.editMenuIndex = index;

    if (index >= 0) {
      this.modalTitulo = 'Editar Módulo Principal';
      this.tempMenu = JSON.parse(JSON.stringify(this.aplicacion.Rol.Menu[index]));
    } else {
      this.modalTitulo = 'Nuevo Módulo Principal';
      this.tempMenu = this.crearMenuVacio();
    }
    this.tempMenu.icono = this.sanitizarIcono(this.tempMenu.icono, 'layers');

    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  guardarModalMenu(): void {
    if (!this.tempMenu.nombre.trim()) {
      this.utilservice.AlertMini('top-end', 'warning', 'El nombre del menú es requerido', 2500);
      return;
    }

    if (!this.tempMenu.url.trim()) {
      this.tempMenu.url = '/' + this.tempMenu.nombre.toLowerCase().replace(/\s+/g, '-');
    }

    if (!this.tempMenu.descripcion) {
      this.tempMenu.descripcion = this.tempMenu.nombre;
    }

    if (this.editMenuIndex >= 0) {
      const subMenusExistentes = this.aplicacion.Rol.Menu[this.editMenuIndex].SubMenu || [];
      const privExistentes = this.aplicacion.Rol.Menu[this.editMenuIndex].Privilegio || [];
      this.aplicacion.Rol.Menu[this.editMenuIndex] = {
        ...this.tempMenu,
        SubMenu: subMenusExistentes,
        Privilegio: privExistentes,
      };
    } else {
      this.aplicacion.Rol.Menu.push({
        ...this.tempMenu,
        SubMenu: [],
        Privilegio: [],
      });
    }

    this.sincronizarTextoJSON();
    this.modalService.dismissAll();
    this.utilservice.AlertMini('top-end', 'success', 'Módulo guardado en diseñador', 2000);
    this.cdr.detectChanges();
  }

  eliminarMenu(index: number): void {
    const menu = this.aplicacion.Rol.Menu[index];
    if (confirm(`¿Está seguro de eliminar el menú "${menu.nombre}" y todos sus submenús?`)) {
      this.aplicacion.Rol.Menu.splice(index, 1);
      this.sincronizarTextoJSON();
      this.utilservice.AlertMini('top-end', 'info', 'Menú eliminado', 2000);
      this.cdr.detectChanges();
    }
  }

  moverMenu(index: number, direccion: 'arriba' | 'abajo'): void {
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= this.aplicacion.Rol.Menu.length) return;
    const item = this.aplicacion.Rol.Menu.splice(index, 1)[0];
    this.aplicacion.Rol.Menu.splice(nuevoIndex, 0, item);
    this.sincronizarTextoJSON();
    this.cdr.detectChanges();
  }

  // ============================================================================
  // Operaciones del Árbol Jerárquico: Nivel 2 (SubMenú)
  // ============================================================================

  abrirModalSubMenu(content: TemplateRef<any>, menuIndex: number, subIndex: number = -1): void {
    this.modalTipo = 'submenu';
    this.editMenuIndex = menuIndex;
    this.editSubMenuIndex = subIndex;

    if (subIndex >= 0) {
      this.modalTitulo = `Editar SubMenú de "${this.aplicacion.Rol.Menu[menuIndex].nombre}"`;
      this.tempSubMenu = JSON.parse(
        JSON.stringify(this.aplicacion.Rol.Menu[menuIndex].SubMenu[subIndex])
      );
    } else {
      this.modalTitulo = `Agregar SubMenú a "${this.aplicacion.Rol.Menu[menuIndex].nombre}"`;
      this.tempSubMenu = this.crearSubMenuVacio();
    }
    this.tempSubMenu.icono = this.sanitizarIcono(this.tempSubMenu.icono, 'layout');

    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  guardarModalSubMenu(): void {
    if (!this.tempSubMenu.nombre.trim()) {
      this.utilservice.AlertMini('top-end', 'warning', 'El nombre del submenú es requerido', 2500);
      return;
    }

    if (!this.tempSubMenu.descripcion) {
      this.tempSubMenu.descripcion = this.tempSubMenu.nombre;
    }

    const menuPadre = this.aplicacion.Rol.Menu[this.editMenuIndex];
    if (!menuPadre.SubMenu) {
      menuPadre.SubMenu = [];
    }

    // Al agregar submenús, asegurar que el padre sea collapsible y se expanda
    if (menuPadre.clase === 'item') {
      menuPadre.clase = 'collapsible';
    }
    menuPadre.isExpanded = true;

    if (this.editSubMenuIndex >= 0) {
      const privsExistentes = menuPadre.SubMenu[this.editSubMenuIndex].Privilegios || [];
      menuPadre.SubMenu[this.editSubMenuIndex] = {
        ...this.tempSubMenu,
        Privilegios: privsExistentes,
      };
    } else {
      menuPadre.SubMenu.push({
        ...this.tempSubMenu,
        Privilegios: [],
      });
    }

    this.sincronizarTextoJSON();
    this.modalService.dismissAll();
    this.utilservice.AlertMini('top-end', 'success', 'SubMenú guardado en diseñador', 2000);
    this.cdr.detectChanges();
  }

  eliminarSubMenu(menuIndex: number, subIndex: number): void {
    const sub = this.aplicacion.Rol.Menu[menuIndex].SubMenu[subIndex];
    if (confirm(`¿Está seguro de eliminar el submenú "${sub.nombre}"?`)) {
      this.aplicacion.Rol.Menu[menuIndex].SubMenu.splice(subIndex, 1);
      this.sincronizarTextoJSON();
      this.utilservice.AlertMini('top-end', 'info', 'SubMenú eliminado', 2000);
      this.cdr.detectChanges();
    }
  }

  moverSubMenu(menuIndex: number, subIndex: number, direccion: 'arriba' | 'abajo'): void {
    const lista = this.aplicacion.Rol.Menu[menuIndex].SubMenu;
    const nuevoIndex = direccion === 'arriba' ? subIndex - 1 : subIndex + 1;
    if (nuevoIndex < 0 || nuevoIndex >= lista.length) return;
    const item = lista.splice(subIndex, 1)[0];
    lista.splice(nuevoIndex, 0, item);
    this.sincronizarTextoJSON();
    this.cdr.detectChanges();
  }

  // ============================================================================
  // Operaciones del Árbol Jerárquico: Nivel 3 (Privilegio / Acción)
  // ============================================================================

  abrirModalPrivilegio(
    content: TemplateRef<any>,
    menuIndex: number,
    subIndex: number,
    privIndex: number = -1
  ): void {
    this.modalTipo = 'privilegio';
    this.editMenuIndex = menuIndex;
    this.editSubMenuIndex = subIndex;
    this.editPrivilegioIndex = privIndex;

    const sub = this.aplicacion.Rol.Menu[menuIndex].SubMenu[subIndex];

    if (privIndex >= 0) {
      this.modalTitulo = `Editar Acción en "${sub.nombre}"`;
      this.tempPrivilegio = JSON.parse(JSON.stringify(sub.Privilegios[privIndex]));
    } else {
      this.modalTitulo = `Agregar Acción en "${sub.nombre}"`;
      this.tempPrivilegio = this.crearPrivilegioVacio();
    }

    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  guardarModalPrivilegio(): void {
    if (!this.tempPrivilegio.metodo.trim()) {
      this.utilservice.AlertMini('top-end', 'warning', 'El método es requerido (ej: agregar)', 2500);
      return;
    }

    if (!this.tempPrivilegio.descripcion) {
      this.tempPrivilegio.descripcion = this.tempPrivilegio.metodo;
    }

    if (!this.tempPrivilegio.accion) {
      const cap = this.tempPrivilegio.metodo.charAt(0).toUpperCase() + this.tempPrivilegio.metodo.slice(1);
      this.tempPrivilegio.accion = `${cap}()`;
    }

    const sub = this.aplicacion.Rol.Menu[this.editMenuIndex].SubMenu[this.editSubMenuIndex];
    if (!sub.Privilegios) {
      sub.Privilegios = [];
    }

    if (this.editPrivilegioIndex >= 0) {
      sub.Privilegios[this.editPrivilegioIndex] = { ...this.tempPrivilegio };
    } else {
      sub.Privilegios.push({ ...this.tempPrivilegio });
    }
    sub.isExpanded = true;

    this.sincronizarTextoJSON();
    this.modalService.dismissAll();
    this.utilservice.AlertMini('top-end', 'success', 'Acción guardada en diseñador', 2000);
    this.cdr.detectChanges();
  }

  eliminarPrivilegio(menuIndex: number, subIndex: number, privIndex: number): void {
    const sub = this.aplicacion.Rol.Menu[menuIndex].SubMenu[subIndex];
    sub.Privilegios.splice(privIndex, 1);
    this.sincronizarTextoJSON();
    this.utilservice.AlertMini('top-end', 'info', 'Acción eliminada', 2000);
    this.cdr.detectChanges();
  }

  // ============================================================================
  // Visor y Editor JSON en Vivo
  // ============================================================================

  sincronizarTextoJSON(): void {
    this.jsonEditorText = JSON.stringify(this.aplicacion, null, 2);
  }

  aplicarJSONDesdeEditor(): void {
    try {
      const parsed = JSON.parse(this.jsonEditorText);
      if (!parsed.id || !parsed.nombre) {
        this.utilservice.AlertMini(
          'top-end',
          'warning',
          'El JSON debe contener al menos los atributos "id" y "nombre"',
          3000
        );
        return;
      }
      this.aplicacion = parsed;
      if (!this.aplicacion.Rol) {
        this.aplicacion.Rol = { descripcion: this.aplicacion.nombre, Menu: [] };
      }
      if (!this.aplicacion.Rol.Menu) {
        this.aplicacion.Rol.Menu = [];
      }
      this.utilservice.AlertMini(
        'top-end',
        'success',
        'JSON aplicado exitosamente al diseñador',
        2500
      );
      this.cdr.detectChanges();
    } catch (e) {
      this.utilservice.AlertMini(
        'top-end',
        'error',
        'Formato JSON no válido. Revise la sintaxis.',
        3000
      );
    }
  }

  copiarJSON(): void {
    this.sincronizarTextoJSON();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.jsonEditorText).then(() => {
        this.utilservice.AlertMini('top-end', 'success', 'JSON copiado al portapapeles', 2500);
      });
    } else {
      this.utilservice.AlertMini('top-end', 'info', 'Seleccione y copie el texto del editor', 2500);
    }
  }

  descargarJSON(): void {
    this.sincronizarTextoJSON();
    const blob = new Blob([this.jsonEditorText], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.aplicacion.id || 'menu-schema'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.utilservice.AlertMini('top-end', 'success', 'Archivo JSON descargado', 2500);
  }

  // ============================================================================
  // Funciones Auxiliares de Presentación UI
  // ============================================================================

  obtenerNombreColor(colorId: string): string {
    const col = this.coloresSugeridos.find((c) => c.id === colorId);
    return col ? col.name : 'Color personalizado';
  }

  obtenerHexColor(colorId: string): string {
    const col = this.coloresSugeridos.find((c) => c.id === colorId);
    return col ? col.hex : '#94a3b8';
  }

  // ============================================================================
  // Exportar Documentación Técnica en PDF (jsPDF + autoTable)
  // ============================================================================

  exportarPDF(esquemaParaExportar?: IAplicacionSchema): void {
    const app = esquemaParaExportar || this.aplicacion;

    if (!app || !app.id) {
      this.utilservice.AlertMini('top-end', 'warning', 'No hay aplicación seleccionada para exportar', 3000);
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // =========================================================================
    // PÁGINA 1: PORTADA Y FICHA TÉCNICA EJECUTIVA
    // =========================================================================

    // Barra superior de acento corporativo (Slate 800 + Azul Eléctrico)
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 12, 'F');

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 12, pageWidth, 2.5, 'F');

    // Membrete Superior
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('CODE-EPIC TECHNOLOGIES  |  CONSOLA DE GESTIÓN Y SEGURIDAD V2', 15, 23);

    // Título Principal del Reporte
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CATÁLOGO Y ESPECIFICACIÓN DE MENÚ', 15, 38);

    // Subtítulo con nombre de la aplicación
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text((app.nombre || 'APLICACIÓN').toUpperCase(), 15, 47);

    // Badge de versión
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(15, 52, 34, 7, 2, 2, 'FD');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text(`VERSIÓN ${app.version || '1.0.0'}`, 18, 57);

    // Caja de Ficha Técnica
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, 66, pageWidth - 30, 78, 3, 3, 'FD');

    // Título de la Ficha
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('INFORMACIÓN GENERAL DEL ESQUEMA', 22, 76);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(22, 79, pageWidth - 22, 79);

    // Items de Ficha Técnica
    const metaItems = [
      { label: 'Identificador (ID Único):', val: app.id || 'N/A' },
      { label: 'Nombre Comercial:', val: app.nombre || 'N/A' },
      { label: 'Endpoint / URL Base:', val: app.url || 'No especificada' },
      { label: 'Autor / Organización:', val: app.autor || 'Code-Epic Technologies' },
      { label: 'Rol / Descripción del Sistema:', val: app.Rol?.descripcion || 'Consola Sistema' },
      { label: 'Comentarios / Observaciones:', val: app.comentario || 'Sin observaciones registradas' },
    ];

    let startY = 87;
    metaItems.forEach((item) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, 22, startY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(item.val, 80, startY);
      startY += 8.5;
    });

    // Métricas Estadísticas (KPI Cards)
    const totalModulos = app.Rol?.Menu?.length || 0;
    let totalSubmenus = 0;
    let totalPrivilegios = 0;

    (app.Rol?.Menu || []).forEach((m) => {
      totalSubmenus += m.SubMenu?.length || 0;
      (m.SubMenu || []).forEach((s) => {
        totalPrivilegios += s.Privilegios?.length || 0;
      });
    });

    const kpiY = 154;
    const cardWidth = (pageWidth - 30 - 10) / 3;

    // KPI 1: Módulos
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(15, kpiY, cardWidth, 26, 2, 2, 'FD');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`${totalModulos}`, 15 + cardWidth / 2, kpiY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('MÓDULOS PRINCIPALES', 15 + cardWidth / 2, kpiY + 19, { align: 'center' });

    // KPI 2: Submenús
    const kpi2X = 15 + cardWidth + 5;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(kpi2X, kpiY, cardWidth, 26, 2, 2, 'FD');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(`${totalSubmenus}`, kpi2X + cardWidth / 2, kpiY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('SUBMENÚS ASOCIADOS', kpi2X + cardWidth / 2, kpiY + 19, { align: 'center' });

    // KPI 3: Privilegios
    const kpi3X = kpi2X + cardWidth + 5;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(kpi3X, kpiY, cardWidth, 26, 2, 2, 'FD');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(`${totalPrivilegios}`, kpi3X + cardWidth / 2, kpiY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ACCIONES & PRIVILEGIOS', kpi3X + cardWidth / 2, kpiY + 19, { align: 'center' });

    // Bloque de pie en portada
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Documento generado el ${new Date().toLocaleString()} | Sistema Consola v2`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );

    // =========================================================================
    // PÁGINA 2+: TABLA DETALLADA DE NAVEGACIÓN Y PRIVILEGIOS
    // =========================================================================
    doc.addPage();

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. Árbol Estructural de Navegación y Permisos', 15, 18);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Esquema jerárquico configurado en MongoDB para ${app.nombre} (${app.id})`,
      15,
      24
    );

    const tableRows: any[][] = [];
    const rowConfig: any[] = [];

    (app.Rol?.Menu || []).forEach((m, mIdx) => {
      const tipoSimbolo = m.clase === 'collapsible' ? '▾ Desplegable' : '● Directo';
      tableRows.push([
        `${mIdx + 1}. ${m.nombre.toUpperCase()}`,
        '—',
        m.url || '—',
        `${tipoSimbolo} [${m.icono || 'layers'}]`,
        '—'
      ]);
      rowConfig.push({ type: 'module' });

      if (m.SubMenu && m.SubMenu.length > 0) {
        m.SubMenu.forEach((s) => {
          let privStr = 'Sin acciones registradas';
          if (s.Privilegios && s.Privilegios.length > 0) {
            privStr = s.Privilegios.map((p) => `• ${p.metodo} (${p.accion})`).join('\n');
          }

          tableRows.push([
            '',
            `↳ ${s.nombre}`,
            s.url || '—',
            `${s.color || 'default'} [${s.icono || 'layout'}]`,
            privStr
          ]);
          rowConfig.push({ type: 'submenu' });
        });
      }
    });

    autoTable(doc, {
      startY: 29,
      head: [['MÓDULO', 'SUBMENÚ', 'RUTA (URL)', 'TIPO / COLOR / ÍCONO', 'MÉTODOS & ACCIONES JS']],
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.8,
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 38 },
        2: { cellWidth: 38 },
        3: { cellWidth: 36 },
        4: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        const idx = data.row.index;
        const cfg = rowConfig[idx];
        if (data.section === 'body') {
          if (cfg && cfg.type === 'module') {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [15, 23, 42];
          } else if (cfg && cfg.type === 'submenu') {
            data.cell.styles.fillColor = [255, 255, 255];
          }
        }
      },
    });

    // Paginación en todas las páginas ("Página X de Y")
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Code-Epic Technologies  |  Consola Sistema  |  Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    const safeName = (app.id || 'esquema').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Especificacion_Menu_${safeName}.pdf`);
    this.utilservice.AlertMini('top-end', 'success', 'Documento PDF generado exitosamente', 2500);
  }

  // ============================================================================
  // Funciones Auxiliares para Modelos Vacíos
  // ============================================================================

  private crearEsquemaVacio(): IAplicacionSchema {
    return {
      id: '',
      nombre: '',
      url: '',
      comentario: '',
      version: '1.0.0',
      autor: 'Code-Epic Technologies',
      Rol: {
        descripcion: '',
        Menu: [],
      },
    };
  }

  private crearMenuVacio(): IMenuItem {
    return {
      url: '',
      js: '',
      icono: 'layers',
      descripcion: '',
      nombre: '',
      accion: '',
      clase: 'collapsible',
      color: '',
      Privilegio: [],
      SubMenu: [],
      isExpanded: false,
    };
  }

  private crearSubMenuVacio(): ISubMenuItem {
    return {
      url: '',
      js: '',
      descripcion: '',
      icono: 'layout',
      nombre: '',
      accion: "CargarUrl('control', 'buzon')",
      clase: 'item',
      color: 'bg-c-blue',
      Privilegios: [],
      isExpanded: false,
    };
  }

  private crearPrivilegioVacio(): IPrivilegioMenu {
    return {
      metodo: 'agregar',
      descripcion: 'Agregar',
      accion: 'Agregar()',
      directivas: '',
    };
  }
}
