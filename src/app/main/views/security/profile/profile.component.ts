import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'
import { AccionMenu, AddModulo, AddSubMenu, AgregarAccion, ApiService, DefinirMenu, IAPICore } from '@services/apicore/api.service'
import { IPerfil } from '@services/seguridad/rol.service'
import { UtilService } from '@services/util/util.service'
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable'
import JSONFormatter from 'json-formatter-js'
import { BlockUI, NgBlockUI } from 'ng-block-ui'



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})



export class ProfileComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent
  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  }

  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public Perfil: IPerfil = {
    nombre: '',
    descripcion: '',
    estatus: 1,
    aplicacion: 0
  }


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


  public lstAplicaciones = []
  public lstRol = []
  public dataRolDetalles = []
  public dataRol = []
  public showDiv: boolean = false
  public datamenu = []

  public xaccion = ''
  public rol = undefined
  public registrar = 'Registrar nuevo perfil'

  @ViewChild('tableRowDetails') tableRowDetails: any


  public ColumnMode = ColumnMode

  public chkBoxSelected = []
  public lstPerfil = []

  public SelectOn = []

  public blApp : boolean = true

  active:any = 1;

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }




  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Seguridad',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/home',
          },
          {
            name: 'Seguridad',
            isLink: false,
          },
          {
            name: 'Definir Rol',
            isLink: false,
          },
        ],
      },
    }
    this.CargarListaAplicaciones()
    this.listarPerfiles()
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = '_SYS_LstAplicaciones'
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.Cuerpo.map(e => {
          e.id = e.identificador
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  listarPerfiles(){
      this.xAPI.funcion = '_SYS_CPerfiles'
      this.xAPI.parametros = ''
      this.xAPI.valores = ''
      this.lstPerfil = []
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.lstPerfil = data.Cuerpo
        },
        (error) => {
          console.log(error)
        }
      )
    }

  onSelect({ selected }) {
    this.SelectOn = selected
  }





  selRol(event: any): void {
    console.log(event)
    this.xAPI.funcion = '_SYS_CRol'
    this.xAPI.parametros = event
    this.xAPI.valores = ''
    this.dataRol = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        this.dataRol = data.Cuerpo.map(e => {
          e.id = e.idrol
          e.name = e.rol
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selRolDetalle(event: any): void {
    console.log(event)
    this.xAPI.funcion = '_SYS_CRolDetalles'
    this.xAPI.parametros = event
    this.xAPI.valores = ''
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.dataRolDetalles = data.Cuerpo.map(e => {
          e.name = e.nomb
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  consultarMenu(acc: string) {
    this.xAPI.funcion = 'LstMenus'
    this.xAPI.parametros = acc
    this.datamenu = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.datamenu = data.Cuerpo.map(e => {
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

    this.consultarMenu(this.xmodulo[0].split('|')[0])
  }

  iniciarLista(){
    if (this.SelectOn.length == 0 ) {
      this.lista = this.dataRolDetalles.map(e => {
        e.estatus = 0
        return e
      })

    }else{
      this.lista = this.dataRolDetalles.map( e => {
        let estatus = this.SelectOn.find(el => {
          return el.xaccion == e.xaccion && el.xmenu == e.xmenu
        })
        e.estatus = estatus!=undefined?1:0
        return e
      })
    }
  }

  guardarPerfil(){

    this.iniciarLista() 
    if ( this.Perfil.nombre == "" || this.lista.length == 0 || this.Perfil.aplicacion == undefined) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe verificar los campos', 3000)
      return false
    }
    this.xAPI.funcion = '_SYS_IPerfil'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Perfil)

    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.insertBach(data.msj, 1)
      },
      error => {
        console.error('Data: ', error)
 
      }
    )
  
  }

  insertBach(idperfil, posicion) {


 
    let data = {
      "aplicacion": this.Perfil.aplicacion,
      "perfil" : idperfil,
      "rol": this.rol,
      "modulo": parseInt(this.lista[posicion].xmodulo),
      "menu": parseInt(this.lista[posicion].xmenu),
      "accion": parseInt(this.lista[posicion].xaccion),
      "estatus": parseInt(this.lista[posicion].estatus)
    }
   

    this.xAPI.funcion = '_SYS_IPerfilDetalles'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(data)

    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        // console.log(data)
        console.log(posicion, this.lista.length)
       
        if (posicion > this.lista.length - 1) {
          this.utilservice.AlertMini('top-end', 'success', 'Finalizo con éxito', 3000)
          this.dataRolDetalles = []
          this.Perfil.nombre = ''
          this.Perfil.descripcion = ''
        } else {
          posicion++
          this.insertBach(idperfil, posicion)
          
        }



      },
      error => {
        console.error('Data: ', error)

      }
    )
  
  }


  async listarAcciones() {

    // console.log(this.menu[0])
    this.rowDataAcc = []
    this.xAPI.funcion = 'OMenuAccion'
    this.xAPI.parametros = this.menu[0].split('|')[0]
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
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

  editarRol(row){
    console.log(row)

    this.xAPI.funcion = '_SYS_CPerfil'
    this.xAPI.parametros = row.id
    this.xAPI.valores = ''
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        let idAPP = ""

        this.registrar = 'Editar Perfil'
        this.dataRolDetalles = data.Cuerpo.map(e => {
          this.Perfil.descripcion = e.observacion
          this.Perfil.nombre = e.rol
          idAPP = e.idapp
          e.idmod =  e.idmod
          e.modulo = e.modulo
          e.idmenu =  e.idmenu
          e.menu = e.menu
          e.accid = e.accid
          e.accion = e.accion
          return e
        })
        this.lista = this.dataRolDetalles
        this.blApp = false
        console.log(idAPP)
        this.Perfil.aplicacion = this.lstAplicaciones.find(item => item.id == idAPP).name 
        console.log(this.lstAplicaciones, this.Perfil.aplicacion)
        // this.Perfil.aplicacion = this.aplicacion.name
        // this.selRol(this.aplicacion.id)
        this.active = 2
      },
      (error) => {
        console.log(error)
      }
    )

  }   

  


}