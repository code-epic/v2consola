import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AccionMenu, AddModulo, AddSubMenu, AgregarAccion, ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service';
import { IRol } from '@services/seguridad/rol.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import JSONFormatter from 'json-formatter-js';
import { BlockUI, NgBlockUI } from 'ng-block-ui';



@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})



export class RoleComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;

  public contentHeader: object;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };


  


 
  public titleModal: string = ''
  public titleBtnModal: string = ''

  public basicSelectedOption: number = 10;
  public searchAccion = ''
  public searchSubMenu = ''



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

  public Rol : IRol = {
    nombre: '',
    descripcion: '',
    estatus: 0
  }
  
  public btnMenu = false

  public xnombre = ''
  public xdescripcion = ''


  public lstAplicaciones = []
  public dataModulo = []
  public showDiv: boolean = false
  public datamenu = []

  public xaccion = ""


  @ViewChild('tableRowDetails') tableRowDetails: any;


  public ColumnMode = ColumnMode;

  public chkBoxSelected = [];

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }




  ngOnInit(): void {
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
    console.log(event)
    this.xAPI.funcion = "LstModulos";
    this.xAPI.parametros = event;
    this.xAPI.valores = ''
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
    
    this.consultarMenu(this.xmodulo[0].split('|')[0])
  }





  async listarAcciones() {
   
    console.log(this.menu[0])
    this.rowDataAcc = []
    this.xAPI.funcion = "OMenuAccion"
    this.xAPI.parametros = this.menu[0].split('|')[0]
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.rowDataAcc = data.Cuerpo;
      },
      (error) => {
        console.log(error)
      }
    )
   
  }





  LimpiarMenu() {
    this.estatus = undefined
   
  }

  async addElement(){

    console.log(this.xaccion[0].split('|')[1])

    let e = {
      "idmod" : this.xmodulo[0].split('|')[0],
      "modulo": this.xmodulo[0].split('|')[1],
      "idmenu": this.menu[0].split('|')[0],
      "menu": this.menu[0].split('|')[1],
      "accid": this.xaccion[0].split('|')[0],
      "accion": this.xaccion[0].split('|')[1]
    }
    this.lista.push(e)
    this.rowData = this.lista
    this.temprowData = this.rowData
    console.log(this.rowData)
  }





 
}