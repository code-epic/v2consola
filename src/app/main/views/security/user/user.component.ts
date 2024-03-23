import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AccionMenu, AddModulo, AddSubMenu, AgregarAccion, ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import JSONFormatter from 'json-formatter-js';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class UserComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent
  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object;
  @ViewChild('tableRowDetails') tableRowDetails: any


  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public chkBoxSelected = []
  public dataRolDetalles = []

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

  public IAddSubMenu: AddSubMenu = {
    url: '',
    js: '',
    icon: '',
    nomb: '',
    clase: '',
    color: '',
    tipo: undefined
  }




  public aplicacion
  public xoficina
  public menu

  public oficina: string = ''
  public oficinaid: string = ''
  public menuid: string = ''
  public accionid

  public xnombre = ''
  public xdescripcion = ''


  public lstAplicaciones = []
  public dataOficina = []
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

  public tipoacceso = [
    { id: '1', name: 'PROPIO' },
    { id: '2', name: 'LDAP' },
    { id: '3', name: 'DIRECTORIO ACTIVO' },
    { id: '4', name: 'OTRO' },
  ]

  public respaldo = [
    { id: '1', name: 'SI' },
    { id: '2', name: 'NO' }
  ]


  public estatus = [
    { id: '1', name: 'ACTIVO' },
    { id: '2', name: 'INACTIVO' }
  ]

  public formato = [
    { id: '1', name: 'SHA256' },
    { id: '2', name: 'MD5' }
  ]

  public duracion = [
    { id: 0, name: 'Segundos' },
    { id: 1, name: 'Minutos' },
    { id: 2, name: 'Horas' },
    { id: 3, name: 'Ninguno' }
  ]

  public sesion = [
    { id: 30, name: '30 días' },
    { id: 60, name: '60 días' },
    { id: 90, name: '90 días' },
    { id: 180, name: '180 días' }
  ]


  public ldap = false
  public activedirectory = false
  public property = false
  public tiempoduracion = '0'

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }

  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }


  ngOnInit(): void {
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
            name: "Seguridad",
            isLink: false,
          },
          {
            name: "Definir Usuario",
            isLink: false,
          },
        ],
      },
    };
    this.CargarListaAplicaciones()
  }


  selDuracion(e) {
    console.log(e)
    if (e == 3) {
      this.tiempoduracion = '0'
    }

  }

  selTipoAcceso(e) {
    switch (parseInt(e)) {
      case 1:
        this.property = true
        this.ldap = false
        break;
      case 2:
        this.property = false
        this.ldap = true
        break;
      case 3:
        this.property = false
        this.ldap = true
        break;
      default:
        this.property = false
        this.ldap = false
        this.activedirectory = false
        break;
    }
  }


  async selPerfil(e) {
    this.xAPI.funcion = "_SYS_CPerfil";
    this.xAPI.parametros = e
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
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






  
 




  







}