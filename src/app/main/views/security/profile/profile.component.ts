import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
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

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class ProfileComponent implements OnInit {
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
  public basicSelectedOption: number = 10

  public Perfil: IPerfil = {
    nombre: "",
    descripcion: "",
    estatus: 1,
    aplicacion: 0,
  }

  public showDiv: boolean = false
  public lstAplicaciones = []
  public lstRol = []
  public dataRolDetalles = []
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

  @ViewChild("tableRowDetails") tableRowDetails: any

  public ColumnMode = ColumnMode
  public chkBoxSelected = []
  public lstPerfil = []
  public SelectOn = []
  public blApp: boolean = true
  public xaplicacion = ''
  public xrol = ''

  active: any = 1

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService
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
    }
    this.CargarListaAplicaciones()
    this.listarPerfiles()
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.Cuerpo.map((e) => {
          e.id = e.identificador
          e.name = e.nombre + " : " + e.VERSION
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  listarPerfiles() {
    this.xAPI.funcion = environment.functions.LISTAR_PERFILES
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

  selTab(e) {
    if (this.active == 2) {
      this.blApp = true
      this.dataRolDetalles = []
      this.Perfil.descripcion = ''
      this.Perfil.nombre = ''
    } else {
      this.registrar = "Registrar nuevo perfil"
    }
  }

  onSelect({ selected }) {
    this.SelectOn = selected
  }

  selRol(event: any): void {
    this.xAPI.funcion = environment.functions.LISTAR_ROLES
    this.xAPI.parametros = event
    this.xAPI.valores = ''
    this.dataRol = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        this.dataRol = data.Cuerpo.map((e) => {
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
    this.xAPI.funcion = environment.functions.LISTAR_ROLES_DETALLES
    this.xAPI.parametros = event
    this.xAPI.valores = ''
    this.dataRolDetalles = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.dataRolDetalles = data.Cuerpo.map((e) => {
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
        this.lista = this.lista.filter(e => e.estatus==1)
        this.insertBach(data.msj, 0)
      },
      (error) => {
        console.error("Data: ", error)
      }
    )
  }

  insertBach(idperfil, posicion) {
    if ( posicion >= this.lista.length  ) {
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
    }else{

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
}
