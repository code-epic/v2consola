import { Component, OnInit, ViewChild, ViewEncapsulation, signal } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccionMenu, AddModulo, AddSubMenu, AgregarAccion, ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: true,
    imports: [
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgSelectModule,
    NgxDatatableModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent
]
})
export class MenuComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public contentHeader: object;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public IDefinirMenu: DefinirMenu = {
    nombre: '',
    url: '',
    js: '',
    icon: '',
    clase: '',
    color: '',
    tipo: 0,
    idmod: 0
  }

  public IAccion: AgregarAccion = {
    endpoint: '',
    nomb: '',
    func: '',
    direc: '',
    color: '',
    clase: '',
    icono: ''
  }

  public IAddModulo: AddModulo = {
    nomb: '',
    idapp: 0
  }

  public IAccionMenu: AccionMenu = {
    menuid: 0,
    accionid: 0
  }

  public IAddSubMenu: AddSubMenu = {
    url: '',
    js: '',
    icon: '',
    nomb: '',
    clase: '',
    color: '',
    tipo: undefined
  }

  public titleModal: string = ''
  public titleBtnModal: string = ''

  public basicSelectedOption: number = 10;
  public searchAccion = ''
  public searchSubMenu = ''

  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  public tempDataAcciones = []
  public rowDataAcciones = []
  public countAcciones

  public ListarowSubMenu = []

  public tempDataSubMenu = []
  public rowDataSubMenu = []
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

  private _btnMenu = signal<boolean>(false);
  get btnMenu() { return this._btnMenu(); }


  public lstAplicaciones = []
  public dataModulo = []
  private _showDiv = signal<boolean>(false);
  get showDiv() { return this._showDiv(); }
  public datamenu = []

  public lstEstatus = [
    { id: "1", name: 'TITULO' },
    { id: '0', name: 'SUBTITULO' }
  ]

  public tipoMenu = [
    { id: 1, name: 'TITULO' },
    { id: 0, name: 'SUBTITULO' }
  ]

  public metodos = [
    { id: 'GET', name: 'GET' },
    { id: 'POST', name: 'POST' },
    { id: 'PUT', name: 'PUT' },
    { id: 'DELETE', name: 'DELETE' },
    { id: 'OPTIONS', name: 'OPTIONS' }
  ]

  public aplicacionCtrl = new FormControl(null)
  public xmoduloCtrl = new FormControl(null)
  public menuCtrl = new FormControl(null)
  public IDefinirMenuNombreCtrl = new FormControl('')
  public IDefinirMenuUrlCtrl = new FormControl('')
  public IDefinirMenuIconCtrl = new FormControl('')
  public IDefinirMenuColorCtrl = new FormControl('')
  public IDefinirMenuClaseCtrl = new FormControl('')
  public IDefinirMenuTipoCtrl = new FormControl(null)
  public IDefinirMenuJsCtrl = new FormControl('')
  public basicSelectedOptionCtrl = new FormControl(10)
  public searchAccionCtrl = new FormControl('')
  public IAccionNombreCtrl = new FormControl('')
  public IAccionNombCtrl = new FormControl('')
  public IAccionFuncCtrl = new FormControl('')
  public IAccionClaseCtrl = new FormControl('')
  public IAccionIconoCtrl = new FormControl('')
  public IAccionColorCtrl = new FormControl('')
  public IAccionEndpointCtrl = new FormControl('')
  public IAccionDirecCtrl = new FormControl('')
  public searchSubMenuCtrl = new FormControl('')
  public IAddSubMenuNombCtrl = new FormControl('')
  public IAddSubMenuUrlCtrl = new FormControl('')
  public IAddSubMenuJsCtrl = new FormControl('')
  public IAddSubMenuClaseCtrl = new FormControl('')
  public IAddSubMenuTipoCtrl = new FormControl(null)

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    // content header
    this.contentHeader = {
      headerTitle: "Aplicaciones",
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
            name: "Aplicaciones",
            isLink: false,
          },
          {
            name: "Definir Menu",
            isLink: false,
          },
        ],
      },
    };
    this.CargarListaAplicaciones()
  }

  async CargarListaAplicaciones() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES;
    this.xAPI.parametros = ''
    this._isLoading.set(true);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.Cuerpo.map(e => {
          e.id = e.identificador
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        });
        this._isLoading.set(false);
      },
      (error) => {
        console.log(error)
        this._isLoading.set(false);
      }
    )
  }

  selModulo(event: any): void {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_MODULOS;
    this.xAPI.parametros = event;
    this.xAPI.valores = ''
    this.dataModulo = [];
    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.dataModulo = data.Cuerpo.map(e => {
          e.name = e.nomb
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  consultarMenu(acc: string) {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_MENUS
    this.xAPI.parametros = acc
    this.datamenu = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.datamenu = data.Cuerpo.map(e => {
          e.name = e.nomb
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }


  selectEventModulo(item) {
    this.moduloid = item.id;
    this.modulo = item.name;
    this.consultarMenu(item.id)
  }

  selectEventMenu(item) {
    // console.log(item)
    this._showDiv.set(false)
    this.menu = item
    this.menuid = item.id
    this.IDefinirMenu.nombre = item.name
  }

  onFocusedModulo(item) {
    this.moduloid = '';
    this.modulo = '';
    this.IAddModulo.nomb = item.target.value
    this.IAddModulo.idapp = this.aplicacion
  }

  onFocusedMenu(item) {
    if (this.moduloid == undefined) this.guardarModulo()
  }

  guardarModulo() {
    if (this.menu != '') {
      this.xAPI = {} as IAPICore
      this.xAPI.funcion = "AgregarModulo"
      this.xAPI.parametros = ''
      this.xAPI.valores = JSON.stringify(this.IAddModulo)
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.dataModulo = []
          if (data.tipo == 1) {
            console.log('MenuID, ', data)
            this.moduloid = data.msj
            this.xmodulo.id = data.msj
            this.utilservice.AlertMini('top-end', 'success', 'Modulo Registrado!', 3000)
            this.selModulo(this.aplicacion)
          } else {
            this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
          }
        },
        (error) => {
          console.log(error)
        }
      )
    }
  }

  syncFormControlsFromMenu(): void {
    this.aplicacionCtrl.setValue(this.aplicacion ?? null)
    this.xmoduloCtrl.setValue(this.xmodulo ?? null)
    this.menuCtrl.setValue(this.menu ?? null)
    this.IDefinirMenuNombreCtrl.setValue(this.IDefinirMenu.nombre ?? '')
    this.IDefinirMenuUrlCtrl.setValue(this.IDefinirMenu.url ?? '')
    this.IDefinirMenuIconCtrl.setValue(this.IDefinirMenu.icon ?? '')
    this.IDefinirMenuColorCtrl.setValue(this.IDefinirMenu.color ?? '')
    this.IDefinirMenuClaseCtrl.setValue(this.IDefinirMenu.clase ?? '')
    this.IDefinirMenuTipoCtrl.setValue(this.IDefinirMenu.tipo ?? null)
    this.IDefinirMenuJsCtrl.setValue(this.IDefinirMenu.js ?? '')
    this.basicSelectedOptionCtrl.setValue(this.basicSelectedOption)
    this.searchAccionCtrl.setValue(this.searchAccion ?? '')
    this.IAccionNombreCtrl.setValue(this.IAccion.nomb ?? '')
    this.IAccionNombCtrl.setValue(this.IAccion.nomb ?? '')
    this.IAccionFuncCtrl.setValue(this.IAccion.func ?? '')
    this.IAccionClaseCtrl.setValue(this.IAccion.clase ?? '')
    this.IAccionIconoCtrl.setValue(this.IAccion.icono ?? '')
    this.IAccionColorCtrl.setValue(this.IAccion.color ?? '')
    this.IAccionEndpointCtrl.setValue(this.IAccion.endpoint ?? '')
    this.IAccionDirecCtrl.setValue(this.IAccion.direc ?? '')
    this.searchSubMenuCtrl.setValue(this.searchSubMenu ?? '')
    this.IAddSubMenuNombCtrl.setValue(this.IAddSubMenu.nomb ?? '')
    this.IAddSubMenuUrlCtrl.setValue(this.IAddSubMenu.url ?? '')
    this.IAddSubMenuJsCtrl.setValue(this.IAddSubMenu.js ?? '')
    this.IAddSubMenuClaseCtrl.setValue(this.IAddSubMenu.clase ?? '')
    this.IAddSubMenuTipoCtrl.setValue(this.IAddSubMenu.tipo ?? null)
  }

  syncMenuFromFormControls(): void {
    this.aplicacion = this.aplicacionCtrl.value
    this.xmodulo = this.xmoduloCtrl.value
    this.menu = this.menuCtrl.value
    this.IDefinirMenu.nombre = this.IDefinirMenuNombreCtrl.value
    this.IDefinirMenu.url = this.IDefinirMenuUrlCtrl.value
    this.IDefinirMenu.icon = this.IDefinirMenuIconCtrl.value
    this.IDefinirMenu.color = this.IDefinirMenuColorCtrl.value
    this.IDefinirMenu.clase = this.IDefinirMenuClaseCtrl.value
    this.IDefinirMenu.tipo = this.IDefinirMenuTipoCtrl.value
    this.IDefinirMenu.js = this.IDefinirMenuJsCtrl.value
    this.basicSelectedOption = this.basicSelectedOptionCtrl.value
    this.searchAccion = this.searchAccionCtrl.value
    this.IAccion.nomb = this.IAccionNombreCtrl.value
    this.IAccion.nomb = this.IAccionNombCtrl.value
    this.IAccion.func = this.IAccionFuncCtrl.value
    this.IAccion.clase = this.IAccionClaseCtrl.value
    this.IAccion.icono = this.IAccionIconoCtrl.value
    this.IAccion.color = this.IAccionColorCtrl.value
    this.IAccion.endpoint = this.IAccionEndpointCtrl.value
    this.IAccion.direc = this.IAccionDirecCtrl.value
    this.searchSubMenu = this.searchSubMenuCtrl.value
    this.IAddSubMenu.nomb = this.IAddSubMenuNombCtrl.value
    this.IAddSubMenu.url = this.IAddSubMenuUrlCtrl.value
    this.IAddSubMenu.js = this.IAddSubMenuJsCtrl.value
    this.IAddSubMenu.clase = this.IAddSubMenuClaseCtrl.value
    this.IAddSubMenu.tipo = this.IAddSubMenuTipoCtrl.value
  }

  Limpiar() {
    this.LimpiarMenu()
    this.aplicacion = undefined
    this.xmodulo = undefined
    this.menu = undefined
    this.syncFormControlsFromMenu()
    this._showDiv.set(false)
    this.rowDataAcc = []
  }

  procesar() {
    this._showDiv.set(true)
    this.listarAcciones(this.menuid)
    this.listarSubmenu(this.menuid)
  }

  async listarAcciones(item: any) {
    if (item > 0) {
      this.rowDataAcc = []
      this.xAPI = {} as IAPICore
      this.xAPI.funcion = "OMenuAccion"
      this.xAPI.parametros = item
      this.xAPI.valores = ''
      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          var i = 0
          this.lista = []
          if (data.Cuerpo != undefined) {

            data.Cuerpo.map(e => {
              if (i == 0) {
                this._btnMenu.set(true)
                this.IDefinirMenu.id = e.id
                this.IDefinirMenu.nombre = e.nomb
                this.IDefinirMenu.url = e.url
                this.IDefinirMenu.js = e.js
                this.IDefinirMenu.clase = e.clase
                this.IDefinirMenu.icon = e.icon
                this.IDefinirMenu.color = e.color
                this.IDefinirMenu.tipo = e.type
                this.syncFormControlsFromMenu()
              }
              if (e.endpoint != undefined) {
                this.lista.push(e)
              }
            })
            this.rowDataAcc = this.lista;
          }



        },
        (error) => {
          console.log(error)
        }
      )
    } else {
      this.utilservice.AlertMini('top-end', 'warning', 'No se encontro el menu', 3000)
      let mnu = this.IDefinirMenu.nombre
      this.LimpiarMenu()
      this.menu = undefined
      this.IDefinirMenu.nombre = mnu
      this.syncFormControlsFromMenu()
      this.rowDataAcc = []
    }
  }

  async listarSubmenu(item: string) {
    this.ListarowSubMenu = []
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = "OSubMenuAccion"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var i = 0
        var lista = []
        data.Cuerpo.map(e => {
          lista.push(e)
        });
        this.ListarowSubMenu = lista;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  GuardarMenu() {
    this.IDefinirMenu.idmod = this.xmodulo.id
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = "AgregarMenu";
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IDefinirMenu)
    console.log(this.IDefinirMenu)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data.tipo == 1) {
          this.LimpiarMenu()
          this.syncFormControlsFromMenu()
          this.utilservice.AlertMini('top-end', 'success', 'Menu Registrado Exitosamente!', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  UpdateMenu(item: any) {
    this.IDefinirMenu.id = item
    this.IDefinirMenu.idmod = this.xmodulo.id
    this.xAPI = {} as IAPICore
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IDefinirMenu)
    this.xAPI.funcion = environment.functions.ACTUALIAZAR_MENU;
    console.log(this.IDefinirMenu)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        if (data.tipo == 1) {
          this.LimpiarMenu()
          this.utilservice.AlertMini('top-end', 'success', 'Menu Actualizado Exitosamente!', 3000)
          this.listarAcciones(this.menuid)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  LimpiarMenu() {
    this.estatus = undefined
    this.IDefinirMenu = {
      nombre: '',
      url: '',
      js: '',
      icon: '',
      clase: '',
      color: '',
      tipo: undefined,
      idmod: 0
    }
  }

  limpiarModalAcciones() {
    this.IAccion = {
      endpoint: '',
      nomb: '',
      func: '',
      direc: '',
      color: '',
      clase: '',
      icono: ''
    }
    this.syncFormControlsFromMenu()
  }


  filterUpdateAcciones(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempDataAcciones.filter(function (d) {
      return d.nomb.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowDataAcciones = temp;
    this.countAcciones = this.rowDataAcciones.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterUpdateSubMenu(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempDataSubMenu.filter(function (d) {
      return d.nomb.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.ListarowSubMenu = temp;
    this.countSubMenu = this.ListarowSubMenu.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  ModalAddSubMenu(modal) {
    this.titleModal = 'Agregar Sub Menu'
    this.titleBtnModal = 'Agregar Sub Menu'
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalAddAcciones(modal) {
    this.titleModal = 'Agregar Acciones'
    this.titleBtnModal = 'Agregar Accion'
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  GuardarAccion() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = "AgregarAccion";
    this.xAPI.valores = JSON.stringify(this.IAccion)
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.accionid = data.msj
          this.MenuAccionGuardar()
          this.modalService.dismissAll('Close')
          this.limpiarModalAcciones()
          this.utilservice.AlertMini('top-end', 'success', 'Accion Registrada Exitosamente', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  MenuAccionGuardar() {
    this.IAccionMenu.accionid = parseInt(this.accionid)
    this.IAccionMenu.menuid = parseInt(this.menuid)
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = "AgregarAccionMenu";
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IAccionMenu)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.listarAcciones(this.menuid)
          this.utilservice.AlertMini('top-end', 'success', 'Accion Registrada Exitosamente', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  GuardarSubMenu() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = "AgregarSubMenu";
    this.xAPI.valores = JSON.stringify(this.IAddSubMenu)
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.modalService.dismissAll('Close')
          this.listarSubmenu(this.menuid)
          this.LimpiarSubMenu()
          this.utilservice.AlertMini('top-end', 'success', 'SubMenu Registrado Exitosamente', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! algo salio mal!', 3000)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  LimpiarSubMenu() {
    this.IAddSubMenu = {
      url: '',
      js: '',
      icon: '',
      nomb: '',
      clase: '',
      color: '',
      tipo: undefined
    }
    this.syncFormControlsFromMenu()
  }



}
