import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';


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

  public basicSelectedOption: number = 10;
  public searchValue = ''

  public tempDataAcciones = []
  public rowDataAcciones = []
  public countAcciones

  public tempDataSubMenu = []
  public rowDataSubMenu = []
  public countSubMenu

  public rowDataAcc = []

  public estatus

  public aplicacion
  public xmodulo
  public menu

  public modulo: string = ''
  public moduloid: string = ''
  public menuid: string = ''


  public lstAplicaciones = []
  public dataModulo = []
  public showDiv: boolean = false
  public datamenu = []

  public lstEstatus = [
    { id: 1, name: 'MENU' },
    { id: 0, name: 'SUBMENU' }
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
    this.dataModulo = [];
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
    this.consultarMenu(item)
  }

  selectEventMenu(item){
    this.menuid = item
  }

  procesarMenu() {
    this.showDiv = true
    this.listarAcciones(this.menuid)
    // this.listarSubmenu(this.menuid)
  }

  async listarAcciones(item: string){
    this.xAPI.funcion = "OMenuAccion"
    this.xAPI.parametros = item
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var i = 0
        var lista = []
        data.Cuerpo.forEach(e => {    
          if(i == 0 ) {
            this.IDefinirMenu.nombre = e.nomb
            this.IDefinirMenu.url = e.url
            this.IDefinirMenu.js = e.js
            this.IDefinirMenu.clase = e.clase
            this.IDefinirMenu.icon = e.icon
            this.IDefinirMenu.color = e.color
            this.IDefinirMenu.tipo = e.type
          }
          if ( e.endpoint != undefined ){
            lista.push(e)
         }
        });       
        this.rowDataAcc = lista;  
      },
      (error) => {
        console.log('')
      }
    )
  }

  async listarSubmenu(item: string){
    this.xAPI.funcion = "OMenuAccion"
    this.xAPI.parametros = item
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var i = 0
        var lista = []
        data.Cuerpo.forEach(e => {    
          if(i == 0 ) {
            this.IDefinirMenu.nombre = e.nomb
            this.IDefinirMenu.url = e.url
            this.IDefinirMenu.js = e.js
            this.IDefinirMenu.clase = e.clase
            this.IDefinirMenu.icon = e.icon
            this.IDefinirMenu.color = e.color
            this.IDefinirMenu.tipo = e.type
          }
          if ( e.endpoint != undefined ){
            lista.push(e)
         }
        });       
        this.rowDataAcc = lista;  
      },
      (error) => {
        console.log('')
      }
    )
  }

  GuardarMenu() {
    this.IDefinirMenu.idmod = this.xmodulo
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.IDefinirMenu)
    this.xAPI.funcion = "AgregarMenu";
    if (this.menuid != '') {
      this.xAPI.funcion = "ActualizarMenu";
    }
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.LimpiarMenu()
          this.utilservice.AlertMini('top-end', 'success', 'Menu Registrado Exitosamente!', 3000)
          this.menuid = this.xAPI.funcion == "AgregarMenu" ? data.msj : this.menuid
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
      tipo: 0,
      idmod: 0
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
    this.rowDataSubMenu = temp;
    this.countSubMenu = this.rowDataSubMenu.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  ModalAddSubMenu(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalAddAcciones(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

}
