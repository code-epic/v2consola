import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'
import { ApiService, IAPICore } from '@services/apicore/api.service'

import { IUser } from '@services/seguridad/rol.service'
import {
  Firmadigital,
  Perfil,
  SAplicacion,
  SMenu,
  SPrivilegios,
  SRol,
  UserService,
  Usuario,
} from '@services/seguridad/user.service'
import { Sha256Service } from '@services/util/sha256'
import { UtilService } from '@services/util/util.service'
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable'
import { environment } from 'environments/environment'

import { BlockUI, NgBlockUI } from 'ng-block-ui'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class UserComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent
  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  }

  public Perfil: Perfil = {
    descripcion: '',
    traza: '',
  }
  public usuario: Usuario = {
    cedula: '',
    nombre: '',
    login: '',
    correo: '',
    clave: '',
    sucursal: '',
    direccion: '',
    cargo: '',
    telefono: '',
    sistema: '',
    token: '',
    estatus: 1,
    Perfil: this.Perfil,
    Aplicacion: [],
    firmadigital: undefined,
    endpoint: '',
  }

  public iUser: IUser = {
    cedula: '',
    tipoacceso: 0,
    respaldo: 0,
    endpoint: '',
    login: '',
    clave: '',
    encriptamiento: '',
    nombre: '',
    descripcion: '',
    estatus: 1,
    vigencia: 180,
    correo: '',
    observaciones: '',
    duraciontexto: 1,
    duraciontiempo: 5,
    oficina: '',
    regional: '',
  }

  public tipoacceso = [
    { id: 0, name: 'SELECCIONAR' },
    { id: 1, name: 'LOCAL' },
    { id: 3, name: 'DIRECTORIO ACTIVO' },
  ]

  public respaldo = [
    { id: 1, name: 'SI' },
    { id: 0, name: 'NO' },
  ]

  public estatus = [
    { id: 1, name: 'ACTIVO' },
    { id: 0, name: 'INACTIVO' },
  ]

  public formato = [
    { id: '1', name: 'SHA256' },
    { id: '2', name: 'MD5' },
  ]

  public duracion = [
    { id: 1, name: 'Segundos' },
    { id: 60, name: 'Minutos' },
    { id: 3600, name: 'Horas' },
  ]

  public sesion = [
    { id: 30, name: '30 días' },
    { id: 60, name: '60 días' },
    { id: 90, name: '90 días' },
    { id: 180, name: '180 días' },
  ]

  public traza = [
    { id: '1|BAJA', name: 'BAJA' }, //CONEXIONES
    { id: '2|MEDIA', name: 'MEDIA' }, //CONEXION - PETIONES ACCIONES I,U,R,D
    { id: '3|ALTA', name: 'ALTA' }, //CONEXION - PETIONES ACCIONES I,U,R,D / SELECT CAPTURAR
  ]

  public dataOficina = [
    { id: 'TODAS', name: 'TODAS' },
  ]

  public dataRegional = [
    { id: 'TODAS', name: 'TODAS' },
  ]

  public Rol: SRol = {
    descripcion: '',
    Menu: [],
  }

  public Menu: SMenu = {
    url: '',
    js: '',
    icono: '',
    descripcion: '',
    nombre: '',
    accion: '',
    clase: '',
    color: '',
    Privilegios: [],
    SubMenu: [],
  }

  public Aplicacion: SAplicacion = {
    id: '',
    nombre: '',
    url: '',
    comentario: '',
    version: '',
    autor: '',
    Rol: {
      descripcion: '',
      Menu: [],
    },
  }

  public ldap: boolean = false
  public activedirectory = false
  public property = false
  public tiempoduracion = '0'
  public descripcion: ''
  public lstAplicacion = []
  public Privilegios: SPrivilegios = {
    metodo: '',
    descripcion: '',
    accion: '',
    directivas: '',
    endpoint: '',
    funcion: '',
  }

  public lstPerfil = []
  public lstEndPoint = []
  public dataUsers = []
  public lstUsersApp = []
  public temprowData = []

  public xaplicacion = ''
  public xperfil = ''
  public xtraza = '1|BAJA'

  public xoficina: any = 'TODAS'
  public xregional: any = 'TODAS'

  public bEndPoint = false

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private userService: UserService,
    private sha256: Sha256Service
  ) {
    this.userService.iniciarObjeto()
    this.CargarListaEndPoint()
  }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Aplicaciones',
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
            name: 'Definir Usuario',
            isLink: false,
          },
        ],
      },
    }
    this.CargarListaAplicaciones()
    // this.CargarGrupo()
    this.iUser.encriptamiento = '1'
  }

  selDuracion(e) {
    console.log(e)
    if (e == 3) {
      this.tiempoduracion = '0'
    }
  }

  selTipoAcceso(e) {
    switch (e) {
      case 1:
        this.property = true
        this.ldap = false
        break
      case 2:
        this.property = false
        this.ldap = true
        break
      case 3:
        this.property = false
        this.ldap = true
        break
      default:
        this.property = false
        this.ldap = false
        this.activedirectory = false
        break
    }
  }

  // async CargarGrupo() {
  //   this.xAPI.funcion = '_SYS_CBitacoraGrupo'
  //   this.xAPI.parametros = ''
  //   await this.apiService.Ejecutar(this.xAPI).subscribe(
  //     (data) => {
  //       console.log(data)
  //     },
  //     (error) => {
  //       console.log(error)
  //     }
  //   )
  // }

  onFocusedRegional(item) {
    // this.moduloid = '';
    // this.modulo = '';
    // this.IAddModulo.nomb = item.target.value
    // this.IAddModulo.idapp = this.aplicacion
  }



  async CargarListaEndPoint() {
    this.lstEndPoint = []
    this.xAPI.funcion = environment.functions.LISTAR_ENDPOINT
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != undefined && data != null) {
          let ends = data[0].usuariosValidos
          ends.forEach(e => {
            this.lstEndPoint.push(
              { name: e.endpoint, id: e.endpoint }
            )
          })

          this.lstEndPoint.push(
            { name: "Crear Nuevo", id: "CN" }
          )



        } else {
          this.bEndPoint = true
          this.iUser.endpoint = ''
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selEndPoint(e) {
    if (this.iUser.endpoint == 'CN') {
      this.bEndPoint = true
      this.iUser.endpoint = ''
    }
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicacion = data.Cuerpo.map((e) => {
          e.id = e.identificador + '|' + e.nombre
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selPerfil(e) {
    // console.log(this.iUser)
    try {
      let codPerfil = e.split('|')[0].toString()
      //this.obtenerAplicacion(e)
      // this.obetnerModulos(codPerfil, e)
      this.xAPI.funcion = environment.functions.LISTAR_PERFIL_APP
      this.xAPI.parametros = codPerfil
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.lstPerfil = data.Cuerpo.map((e) => {
            e.id = `${e.id}|${e.perfil}|${e.llave}`
            e.name = e.perfil
            return e
          })
          // console.log(this.lstPerfil)
        },
        (error) => {
          console.log(error)
        }
      )
    } catch (error) {
      console.error('Errores varios: ', error)
    }
  }

  //OBTENER LA LISTA DE LOS MENU Y ACCIONES DESDE EL PERFIL
  async obetnerModulos(apps) {
    this.xAPI.funcion = environment.functions.LISTAR_MENU_APP
    this.xAPI.parametros = `${apps.idapp},${apps.idper}`
    this.xAPI.valores = ''
    console.log(this.xAPI)
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        let lstMenu = []
        console.log('menu: ', data)
        data.Cuerpo.forEach((e) => {
          if (e.menu_acciones != undefined) {
            let menu = JSON.parse(e.menu_acciones)
            if (menu.acciones != undefined) {
              let lstPriv = []
              menu.acciones.forEach((obj) => {
                if (obj.accion != null) {
                  let Privilegios = {
                    accion: obj.accion,
                    directivas: obj.directiva,
                    funcion: obj.funcion,
                    endpoint: obj.endpoint,
                    clase: obj.clase,
                    icono: obj.icono,
                    color: obj.color,
                    nombre: obj.nombre,
                  }
                  lstPriv.push(Privilegios)
                }
              })
              let Menu = {
                url: menu.url,
                icono: menu.icono,
                color: menu.color,
                nombre: menu.nombre,
                js: menu.js,
                clase: menu.clase,
                SubMenu: [],
                Privilegios: lstPriv,
              }
              lstMenu.push(Menu)
            }
          }
        })

        this.obtenerAplicacion(apps, lstMenu)
        console.log(lstMenu)
        // return lstMenu
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async obtenerAplicacion(apps, Menu: any) {
    let lstApp = []

    // let lstrol: any = []
    let rol: SRol = {
      descripcion: this.xperfil.split('|')[2],
      Menu: Menu,
    }
    // lstrol.push(rol)
    let xapps: SAplicacion = {
      autor: apps.creador,
      id: 'ID-001',
      nombre: apps.nombre,
      version: apps.version,
      url: apps.repositorio,
      comentario: 'Generado por sistema',
      Rol: rol,
    }
    this.Aplicacion = xapps
    lstApp.push(this.Aplicacion)
    this.usuario.Perfil.descripcion = apps.perfil
    this.usuario.Perfil.traza = apps.traza
    this.usuario.cedula = this.iUser.cedula
    this.usuario.login = this.iUser.login
    this.usuario.nombre = this.iUser.nombre
    this.usuario.correo = this.iUser.correo
    this.usuario.cargo = this.iUser.descripcion
    this.usuario.endpoint = this.iUser.endpoint
    this.usuario.sucursal = this.xoficina.name!=undefined?this.xoficina.name: this.xoficina
    this.usuario.direccion = this.xregional!=undefined?this.xregional.name: this.xregional
    // this.usuario.clave = await this.utilservice.generateSHA256Hash(
    //   this.iUser.clave
    // )
    console.log('Entrando en clave',this.iUser.clave )
    if (this.iUser.clave != '') {
      await this.sha256.hash(this.iUser.clave).then(hash => {
        // console.log(this.usuario.clave, '::', this.iUser.clave, hash)
        this.usuario.clave = hash
      })
    }

    console.log(this.iUser, 'Imprimiendo Usuario')
    let firma: Firmadigital = {
      vigencia: this.iUser.vigencia,
      duracion: this.iUser.duraciontiempo * this.iUser.duraciontexto,
      direccionmac: '',
      direccionip: '',
      tiempo: new Date().toISOString(),
      nivel: parseInt(apps.idtra),
    }
    this.usuario.firmadigital = firma
    this.usuario.sistema = apps.aplicacion  //this.xaplicacion.split('|')[1].toString()
    this.usuario.Aplicacion = lstApp

    console.log(this.usuario)
  }

  async agregarAplicacion() {
    let app = {}
    if (
      this.xaplicacion == '' ||
      this.xperfil == '' ||
      this.xtraza == undefined
    ) {
      this.utilservice.AlertMini(
        'top-end',
        'error',
        'Debe verificar los campos',
        3000
      )
      return false
    }
    this.lstAplicacion.forEach((e) => {
      if (e.id == this.xaplicacion) {
        app = {
          id: e.id,
          iduser: 0,
          idapp: this.xaplicacion.split('|')[0],
          aplicacion: this.xaplicacion.split('|')[1],
          idper: this.xperfil.split('|')[0],
          perfil: this.xperfil.split('|')[1],
          idtra: this.xtraza.split('|')[0],
          traza: this.xtraza.split('|')[1],
          estatus: 1,
          repositorio: e.repositorio,
          version: e.VERSION,
          creador: e.creador,
          autor: e.name,
          comentario: e.observacion,
        }
      }
    })

    this.lstUsersApp.push(app)
    // console.log(this.lstUsersApp)

    this.dataUsers = this.lstUsersApp
  }

  quitarElemento(i) {
    console.log(i)
  }

  verPerfil() { }

  eliminarPerfil() { }

  async agregarUsuario() {

    await this.lstUsersApp.forEach(async (e) => {
      await this.obetnerModulos(e)
    })

    Swal.fire({
      title: 'Alerta',
      text: '¿Está seguro que desea guardar usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#C81D11',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok()
      }
    })
  }

  ok() {
    let fnx = {
      coleccion: 'usuario',
      objeto: this.usuario,
      donde: `{"cedula":"${this.usuario.cedula}"}`,
      driver: 'MGDBA',
      upsert: true,
    }

    console.log(this.usuario)
    this.apiService.ExecColeccion(fnx).subscribe(
      (data) => {
        console.log(data)
        this.lstPerfil = []
        this.xaplicacion = ''
        this.xperfil = ''
        this.finalizando()
      },
      (error) => {
        this.utilservice.AlertMini(
          'top-end',
          'error',
          'Error al Guardadar los Datos',
          3000
        )
      }
    )
  }

  finalizando(){
    Swal.fire({
      title: 'Registrado',
      text: 'Tu usuario ha sido registrado codigo:',
      icon: 'info',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#C81D11',
      confirmButtonText: 'Aceptar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.limpiar()
      }
    })
  }
  cancelar() { }

  limpiar() {
    this.iUser = {
      cedula: '',
      tipoacceso: 0,
      respaldo: 0,
      endpoint: '',
      login: '',
      clave: '',
      encriptamiento: '',
      nombre: '',
      descripcion: '',
      estatus: 1,
      vigencia: 180,
      correo: '',
      observaciones: '',
      duraciontexto: 1,
      duraciontiempo: 5,
      oficina: '',
      regional: '',
    }
    this.xoficina = ''
    this.xregional = ''
    this.dataUsers = []
  }

}




