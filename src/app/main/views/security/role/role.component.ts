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
  public cantidadRol = 0

  public estatus = undefined

  public aplicacion
  public xmodulo
  public menu

  public modulo: string = ''
  public moduloid: string = ''
  public menuid: string = ''
  public accionid

  public Rol: IRol = {
    nombre: '',
    descripcion: '',
    estatus: 1
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
    // console.log(event)
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

    // console.log(this.menu[0])
    this.rowDataAcc = []
    this.xAPI.funcion = "OMenuAccion"
    this.xAPI.parametros = this.menu[0].split('|')[0]
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
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

  async addElement(item: any) {
    let e = {
      "idmod": this.xmodulo[0].split('|')[0],
      "modulo": this.xmodulo[0].split('|')[1],
      "idmenu": this.menu[0].split('|')[0],
      "menu": this.menu[0].split('|')[1],
      "accid": this.xaccion[0].split('|')[0],
      "accion": this.xaccion[0].split('|')[1]
    };
    this.lista.push(e);
    this.rowData = this.lista;
    this.temprowData = this.rowData;

    let valor = item[0].split("|")[0];

    this.rowDataAcc = this.rowDataAcc.filter((element) => {
      return element.accid !== valor;
    });

  }


  guardarRol() {

    this.xAPI.funcion = '_SYS_IRolDefinicion'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Rol)

    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.insertBach(data.msj, 0)
      },
      error => {

      }
    )

  }





  insertBach(idrol, posicion) {

    let data = {
      "aplicacion": parseInt(this.aplicacion),
      "rol": idrol,
      "modulo": parseInt(this.lista[posicion].idmod),
      "menu": parseInt(this.lista[posicion].idmenu),
      "accion": parseInt(this.lista[posicion].accid),
      "estatus": 1
    }

    this.xAPI.funcion = '_SYS_IRolDetalles'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(data)

    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        // console.log(data)
        // console.log(posicion, this.lista.length)
        posicion++
        if (posicion > this.lista.length - 1) {
          this.utilservice.AlertMini('top-end', 'success', 'Finalizo con éxito', 3000)
          this.lista = []
          this.rowData = []
          this.aplicacion = undefined
          this.Rol.descripcion = ''
          this.Rol.nombre = ''
          this.xmodulo = ''
          this.dataModulo = []
          this.menu = ''
          this.datamenu = []
          this.xaccion = ''
          this.rowDataAcc = []
        } else {
          this.insertBach(idrol, posicion)
        }


      },
      error => {
        console.error('Data: ', error)

      }
    )
  }






}