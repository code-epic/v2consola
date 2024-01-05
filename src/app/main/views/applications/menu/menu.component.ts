import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AccionMenu, AddModulo, AddSubMenu, AgregarAccion, ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import JSONFormatter from 'json-formatter-js';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
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
    direc: ''
  }

  public IAddModulo: AddModulo = {
    nomb: '',
    idapp: 0
  }

  public IAccionMenu: AccionMenu = {
    menuid: 0,
    accionid: 0
  }

  public IAddSubMenu : AddSubMenu = {
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

  public btnMenu = false


  public lstAplicaciones = []
  public dataModulo = []
  public showDiv: boolean = false
  public datamenu = []

  public lstEstatus = [
    { id: "1", name: 'MENU' },
    { id: '0', name: 'SUBMENU' }
  ]

  public tipoMenu = [
    { id: 1, name: 'MENU' },
    { id: 0, name: 'SUBMENU' }
  ]

  public metodos = [
    { id: 'GET', name: 'GET' },
    { id: 'POST', name: 'POST' },
    { id: 'PUT', name: 'PUT' },
    { id: 'DELETE', name: 'DELETE' },
    { id: 'OPTIONS', name: 'OPTIONS' }
  ]

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
            name: "Home",
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
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.Cuerpo.map(e => {
          e.id = e.identificador
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selModulo(event: any): void {
    this.xAPI.funcion = "LstModulos";
    this.xAPI.parametros = event;
    this.xAPI.valores = ''
    this.dataModulo = [];
    console.log(this.xAPI)
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
    this.xAPI.funcion = "LstMenus"
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
    if( this.moduloid == undefined ) this.guardarModulo()
  }

  guardarModulo(){
    if (this.menu != '') {
    this.xAPI.funcion = "AgregarModulo"
    this.xAPI.parametros =  ''
    this.xAPI.valores = JSON.stringify(this.IAddModulo)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.dataModulo = []
       if (data.tipo == 1) {
        this.moduloid = data.msj
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

  Limpiar(){
    this.LimpiarMenu()
    this.aplicacion = undefined
    this.xmodulo = undefined
    this.menu = undefined
    this.showDiv = false
    this.rowDataAcc = []
  }

  procesar(){
    this.showDiv = true
    this.listarAcciones(this.menuid)
    this.listarSubmenu(this.menuid)
  }

  async listarAcciones(item: any) {
    if (item > 0) {
      // this.showDiv = true
      this.rowDataAcc = []
      this.xAPI.funcion = "OMenuAccion"
      this.xAPI.parametros = item
      this.xAPI.valores = ''
      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          var i = 0
          this.lista = []
          if (data.Cuerpo != undefined) {
            this.btnMenu = true
          }
          data.Cuerpo.map(e => {
            if (i == 0) {
              this.IDefinirMenu.id = e.id
              this.IDefinirMenu.nombre = e.nomb
              this.IDefinirMenu.url = e.url
              this.IDefinirMenu.js = e.js
              this.IDefinirMenu.clase = e.clase
              this.IDefinirMenu.icon = e.icon
              this.IDefinirMenu.color = e.color
              this.IDefinirMenu.tipo = e.type
            }
            if (e.endpoint != undefined) {
              this.lista.push(e)
            }
          });
  
          this.rowDataAcc = this.lista;
        },
        (error) => {
          console.log(error)
        }
      )
       } else {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe Seleccionar Aplicacion - Modulo - Menu', 3000)
    }
  }

  async listarSubmenu(item: string) {
    this.ListarowSubMenu = []
    this.xAPI.funcion = "OSubMenuAccion"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var i = 0
        var lista = []
        console.log(data)
        data.Cuerpo.map(e => {
          // if (i == 0) {
          //   this.IDefinirMenu.nombre = e.nomb
          //   this.IDefinirMenu.url = e.url
          //   this.IDefinirMenu.js = e.js
          //   this.IDefinirMenu.clase = e.clase
          //   this.IDefinirMenu.icon = e.icon
          //   this.IDefinirMenu.color = e.color
          //   this.IDefinirMenu.tipo = e.type
          // }
          // if (e.endpoint != undefined) {
            lista.push(e)
          // }
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
    this.xAPI.funcion = "AgregarMenu";
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IDefinirMenu)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.LimpiarMenu()
          this.utilservice.AlertMini('top-end', 'success', 'Menu Registrado Exitosamente!', 3000)
          // this.menuid = this.xAPI.funcion == "AgregarMenu" ? data.msj : this.menuid
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
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IDefinirMenu)
    this.xAPI.funcion = "ActualizarMenu";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
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

  limpiarModalAcciones(){
    this.IAccion = {
      endpoint: '',
      nomb: '',
      func: '',
      direc: ''
    }
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

  LimpiarSubMenu(){
    this.IAddSubMenu = {
      url: '',
      js: '',
      icon: '',
      nomb: '',
      clase: '',
      color: '',
      tipo: undefined
    }
  }



}
