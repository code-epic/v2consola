import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'
import { ApiService, IAPICore, IConfiguracion } from '@services/apicore/api.service'

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
  id,
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
    id: '',
    descripcion: '',
    traza: '',
  }
  public usuario: Usuario = {
    cedula: '',
    nombre: '',
    descripcion: '',
    observaciones: '',
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
    tipoacceso: 3,
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
    duraciontexto: 60,
    duraciontiempo: 5,
    oficina: '',
    regional: '',
  }

  public tipoacceso = [
    // { id: 0, name: 'SELECCIONAR' },
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
    id: '',
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
    perfil: '',
    traza: '',
    estatus: 0,
    tiempo: '',
    Rol: {
      id: '',
      descripcion: '',
      Menu: [],
    },
  }

  public ldap: boolean = false
  public activedirectory = false
  public property = false
  public tiempoduracion = '0'
  public descripcion: string = ''
  public lstAplicacion: SAplicacion[] = []
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
  public showClave = false;
  public bChangePassword = false
  public blockEdit: string = 'false'
  public blockEditApp: string = 'false'
  public bEliminarAllProfile: boolean = false


  public isBDV: boolean = false


  public configuracion: IConfiguracion;
  public profileData: any;
  public usuarioSave: boolean = false;
  public isEmailInvalid: boolean = false;
  // Password Strength properties
  public passwordStrength: number = 0;
  public passwordStrengthLabel: string = 'Sin seguridad';
  public passwordStrengthColor: string = '';
  public passwordStrengthWidth: number = 0;
  public isPasswordInvalid: boolean = false;


  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private userService: UserService,
    private sha256: Sha256Service,
    private modalService: NgbModal,

  ) {
    this.userService.iniciarObjeto()
    this.CargarListaEndPoint()
  }

  async ngOnInit() {
    this.isBDV = this.apiService.ConsultaSistemaBDV()
    this.consultarRegionales()
    this.contentHeader = {
      headerTitle: 'Aplicaciones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home',
          },
          {
            name: 'Seguridad',
            isLink: false,
          },
          {
            name: 'Crear Usuarios',
            isLink: false,
          },
        ],
      },
    }

    await this.CargarListaAplicaciones()
    let acceso = this.isBDV ? 3 : 1
    this.selTipoAcceso(acceso)
    this.iUser.encriptamiento = '1'



    await this.cargarConfiguracionApp()




  }


  cargarConfiguracionApp() {


    this.xAPI.funcion = environment.functions.CONSULTAR_CONFIGURACION_APP; // Asumiendo que esta es tu función de backend
    this.xAPI.parametros = environment.ID
    this.xAPI.valores = {};

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          if (data.length > 0) {
            this.configuracion = data[0]
            this.iUser.endpoint = this.configuracion.endpoints.login
            this.iUser.duraciontiempo = this.configuracion.sesion.tiempo * this.exportTime(this.configuracion.sesion.unidad)
          }
        }
      },
      (error) => {
        console.error('Error al cargar la configuración de la aplicación:', error);

      }
    );
  }

  exportTime(tiemp: string): number {
    let xtime = 0
    switch (tiemp) {
      case 'segundos':
        xtime = 1
        break;
      case 'minutos':
        xtime = 60
        break;
      case 'horas':
        xtime = 3600
        break;
    }
    return xtime
  }


  cargarUsuario(usuario: Usuario): IUser {
    // Mapeo de propiedades directas
    this.iUser.cedula = usuario.cedula;
    this.iUser.login = usuario.login;
    this.iUser.nombre = usuario.nombre;
    this.iUser.descripcion = usuario.descripcion;
    this.descripcion = usuario.observaciones;
    this.iUser.correo = usuario.correo;
    this.iUser.estatus = usuario.estatus;
    this.iUser.endpoint = usuario.endpoint;

    // Mapeo de propiedades con nombres diferentes (basado en getUserApp)
    this.iUser.descripcion = usuario.cargo;
    this.iUser.oficina = usuario.sucursal;
    this.iUser.regional = usuario.direccion;
    this.xregional = usuario.direccion;
    this.xoficina = usuario.sucursal;

    // Mapeo de propiedades anidadas en 'firmadigital'
    if (usuario.firmadigital) {
      this.iUser.vigencia = usuario.firmadigital.vigencia;
    }

    // No se mapea la clave para evitar mostrar el hash. Se debe ingresar una nueva si se desea cambiar.
    this.iUser.clave = '';
    // this.dataUsers = usuario.Aplicacion;
    this.tk_loadProfile(usuario)

    return this.iUser
  }

  tk_loadProfile(usuario: Usuario) {

    usuario.Aplicacion.forEach(usr => {
      let url = ''
      let xapp = this.getAplication(usr.id)
      let xprof = this.getProfile(usr.perfil)


      if (xapp !== undefined) {
        url = xapp.url
      } else {
        this.blockEditApp = 'false'
      }


      let app = {
        id: usr.id,
        idapp: xapp,
        idper: xprof,
        traza: usr.traza,
        nombre: usr.nombre,
        perfil: usr.perfil,
        estatus: usr.estatus,
        tiempo: usr.tiempo,
        url: url,
      }

      this.lstUsersApp.push(app)
      this.dataUsers = this.lstUsersApp
      // console.log(this.dataUsers)
    });

  }

  selDuracion(e) {
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


  onFocusedRegional(item) {
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
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACIONES
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicacion = data.map((e) => {
          e.name = `${e.id}  (${e.nombre})`
          return e
        })


        let usuario = window.sessionStorage.getItem('validator')

        if (usuario != undefined) {
          this.usuario = JSON.parse(usuario)
          this.xaplicacion = this.usuario.sistema
          this.selPerfil(this.usuario.sistema)
          this.blockEditApp = 'false'
          this.usuarioSave = true
          // console.log(this.usuario)
        }

      },
      (error) => {
        console.log(error)
      }
    )
  }

  selPerfil(e) {

    try {
      let codPerfil = e
      this.xAPI.funcion = environment.functions.OBTENER_PERFILES_POR_APLICACION
      this.xAPI.parametros = codPerfil
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          if (data != undefined && data != null) {
            this.lstPerfil = data
          }

          let usuario = window.sessionStorage.getItem('validator')
          if (usuario != undefined) {
            this.blockEdit = 'disabled'
            this.blockEditApp = 'disabled'

            if (!this.bEliminarAllProfile) {

              this.cargarUsuario(this.usuario)
              if (this.usuario.endpoint == undefined || this.usuario.endpoint == '') {
                this.iUser.tipoacceso = 1
                this.selTipoAcceso(1)
              }
            } else {
              this.blockEditApp = 'false'
            }



          }
        },
        (error) => {
          console.log(error)
        }
      )
    } catch (error) {
      console.error('Errores varios: ', error)
    }
  }


  getAplication(id) {
    return this.lstAplicacion.find((item) => item.id == id)

  }

  getProfile(nombre) {
    return this.lstPerfil.find((item) => item.nombre == nombre)
  }

  async getUserApp() {
    let apps: any = {}
    let lstApp: SAplicacion[] = []

    await this.lstUsersApp.forEach(async (appx) => {
      apps = appx;
      let rol: SRol = {
        id: appx.idper.id,
        descripcion: appx.idper.Rol.descripcion,
        Menu: appx.idper.Rol.Menu,
      }

      let xapps: SAplicacion = {
        autor: appx.idapp.autor,
        id: appx.id,
        nombre: appx.idapp.nombre,
        version: appx.idapp.version,
        url: appx.idapp.url,
        perfil: appx.perfil,
        traza: appx.traza,
        estatus: appx.estatus,
        comentario: 'Generado por sistema',
        tiempo: appx.tiempo,
        Rol: rol,
      }
      lstApp.push(xapps)

    })


    this.usuario.Perfil.id = apps.idper == undefined ? '' : apps.idper.id
    this.usuario.Perfil.descripcion = apps.perfil
    this.usuario.Perfil.traza = apps.traza
    this.usuario.cedula = this.iUser.cedula
    this.usuario.login = this.iUser.login
    this.usuario.nombre = this.iUser.nombre
    this.usuario.descripcion = this.iUser.descripcion
    this.usuario.correo = this.iUser.correo
    this.usuario.cargo = this.iUser.descripcion
    this.usuario.observaciones = this.descripcion
    this.usuario.endpoint = this.iUser.tipoacceso == 3 ? this.iUser.endpoint : ''
    this.usuario.sucursal = this.xoficina.name != undefined ? this.xoficina.name : this.xoficina
    this.usuario.direccion = this.xregional.name != undefined ? this.xregional.name : this.xregional


    let usuario = window.sessionStorage.getItem('validator')


    if (usuario == undefined) {
      if (this.iUser.clave != '') {
        await this.sha256.hash(this.iUser.clave).then(hash => {
          this.usuario.clave = hash
        })
      }
    }



    let firma: Firmadigital = {
      vigencia: this.iUser.vigencia,
      duracion: this.iUser.duraciontiempo,
      direccionmac: '',
      direccionip: '',
      tiempo: new Date().toISOString(),
      nivel: parseInt(apps.idtra),
    }


    this.usuario.firmadigital = firma
    if (apps.idapp == undefined) {
      this.usuario.sistema = 'App.Consola'
      this.usuario.Aplicacion = []
    } else {
      this.usuario.sistema = apps.idapp.id
      this.usuario.Aplicacion = lstApp
    }

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

    if (this.validarSiSeleccion()) {
      this.utilservice.AlertMini(
        'top-end',
        'warning',
        'La aplicación y el perfil seleccionados ya han sido asociados.',
        3000
      )
      return false;
    }

    app = {
      id: this.getAplication(this.xaplicacion).id,
      idapp: this.getAplication(this.xaplicacion),
      idper: this.getProfile(this.xperfil),
      traza: this.xtraza.split('|')[1],
      idtra: this.xtraza.split('|')[0],
      nombre: this.getAplication(this.xaplicacion).nombre,
      url: this.getAplication(this.xaplicacion).url,
      tiempo: new Date().toISOString(),
      perfil: this.getProfile(this.xperfil).nombre,
      estatus: 1,
    }


    // console.log(app)
    this.lstUsersApp.push(app)

    this.dataUsers = this.lstUsersApp
  }

  /**
   * Valida si la combinación de aplicación y perfil seleccionada ya existe en la lista.
   * @returns {boolean} - Devuelve `true` si ya existe, de lo contrario `false`.
   */
  validarSiSeleccion(): boolean {
    const aplicacionId = this.xaplicacion;
    const perfilNombre = this.xperfil;
    const existe = this.dataUsers.some(item =>
      item.id === aplicacionId && item.perfil === perfilNombre
    );

    return existe;
  }

  /**
   * Handles the status change of a user's application access.
   * @param item The user application item that was changed.
   * @param index The index of the item in the dataUsers array.
   */
  onStatusChange(item: any, index: number) {
    const nuevoEstatus = item.estatus;
    this.dataUsers[index].estatus = nuevoEstatus ? 1 : 0
    this.dataUsers[index].tiempo = new Date().toISOString()

    this.lstUsersApp[index].estatus = nuevoEstatus ? 1 : 0
    this.lstUsersApp[index].tiempo = new Date().toISOString()

  }

  quitarElemento(i: number) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que desea eliminar perfil?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#C81D11',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {

        this.dataUsers.splice(i, 1);
        if (this.dataUsers.length == 0) {
          this.blockEditApp = 'false'
          this.bEliminarAllProfile = true
        }

      }

    })

  }

  verPerfil(profileData: any, modal: any) {
    this.profileData = profileData;
    if (this.profileData?.idper?.Rol?.Menu) {
      this.profileData.idper.Rol.Menu.forEach(menu => {
        menu.isExpanded = false;
        menu.SubMenu?.forEach(subMenu => subMenu.isExpanded = false);
      });
    }
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal", scrollable: true
    });
  }




  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
  }



  async agregarUsuario(tipo: number) {

    let usuario = window.sessionStorage.getItem('validator')


    if (usuario == undefined) {
      if (this.property) {
        const password = this.iUser.clave
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

        if (!passwordRegex.test(password)) {
          this.utilservice.AlertMini(
            "top-end",
            "error",
            "La clave no cumple con los requisitos de complejidad. Debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&).",
            8000
          );
          return;
        }
      }
    }



    await this.getUserApp()

    let texto = tipo == 1 ? 'guardar' : 'modificar'

    Swal.fire({
      title: 'Alerta',
      text: '¿Está seguro que desea ' + texto + ' el usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#C81D11',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok(tipo)
      }
    })
  }

  ok(tipo: number) {
    let fnx = {
      coleccion: 'usuario',
      objeto: this.usuario,
      donde: JSON.stringify({ cedula: this.usuario.cedula }),
      driver: 'MGDBA',
      upsert: true,
    }

    this.apiService.ExecColeccion(fnx).subscribe(
      (data) => {
        if (tipo == 2) {
          this.lstPerfil = []
          this.xaplicacion = ''
          this.xperfil = ''
        }

        this.finalizando(tipo)
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

  finalizando(tipo: number) {
    let texto = tipo == 1 ? 'registrado' : 'modificado'
    Swal.fire({
      title: 'Aviso',
      text: 'Tu usuario ha sido ' + texto,
      icon: 'success',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
    }).then((result) => {
      if (result.isConfirmed) {
        if (tipo == 2) {


          this.usuarioSave = false
          this.limpiar()

        } else {
          this.usuarioSave = true
        }
      }
    })
  }

  async limpiar() {
    window.sessionStorage.removeItem('validator')
    this.iUser = {
      cedula: '',
      tipoacceso: 3,
      respaldo: 0,
      endpoint: '',
      login: '',
      clave: '',
      encriptamiento: '1',
      nombre: '',
      descripcion: '',
      estatus: 1,
      vigencia: 180,
      correo: '',
      observaciones: '',
      duraciontexto: 1,
      duraciontiempo: 5,
      oficina: 'TODAS',
      regional: 'TODAS',
    }
    this.xoficina = 'TODAS'
    this.xregional = 'TODAS'
    this.descripcion = ''
    this.dataUsers = []
    this.lstUsersApp = []


    this.blockEdit = 'false'
    this.userService.iniciarObjeto()
    await this.CargarListaEndPoint()


    this.ngOnInit()
  }

  onLoginInput() {
    if (this.isBDV && this.iUser.login && this.iUser.tipoacceso == 3) {
      this.iUser.login = this.iUser.login.toUpperCase();
    }
  }

  SearchLoginLDAP() {
    // console.log(this.configuracion, this.isBDV)
    if (this.isBDV && this.iUser.tipoacceso == 3) {
      console.log(this.configuracion.endpoints.directorioActivo)
      let cod = {
        'codUsuario': this.iUser.login
      }

      let data = {
        'url': this.configuracion.endpoints.directorioActivo,
        'data': JSON.stringify(cod),
      }

      this.apiService.SendRequestPostAnonimous(data).subscribe(
        (data) => {
          if (data.usuario != null) {
            let usr = data.usuario
            this.iUser.cedula = usr.cedula
            this.iUser.nombre = usr.nombres + ' ' + usr.apellidos
            this.iUser.descripcion = usr.descCargo
            this.descripcion = usr.descUnidad
            this.iUser.correo = usr.correo
          } else {
            this.utilservice.AlertMini(
              'top-end',
              'warning',
              'Usuario no se encuentra registrado en el directorio activo',
              3000
            )
          }
        },
        (error) => {
          this.utilservice.AlertMini(
            'top-end',
            'warning',
            error,
            3000
          )
        }
      )

    }
  }


  consultarRegionales() {
    this.dataRegional = []
    if (this.isBDV) {
      this.xAPI.funcion = environment.functions.CONSULTAR_REGIONALES; // Asumiendo que esta es tu función de backend
      this.xAPI.parametros = ''
      this.xAPI.valores = {};

      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.dataRegional = data.Cuerpo
        },
        (error) => {
          console.error('Error al cargar la configuración de la aplicación:', error);

        }
      );
    }
  }

  consultarOficinas(e) {
    this.dataOficina = []
    if (this.isBDV) {
      this.xAPI.funcion = environment.functions.CONSULTAR_OFICINAS; // Asumiendo que esta es tu función de backend
      this.xAPI.parametros = this.utilservice.zfill(e.id, 2)
      this.xAPI.valores = {};
      console.log(this.xAPI)
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.dataOficina = data.Cuerpo
        },
        (error) => {
          console.error('Error al cargar la configuración de la aplicación:', error);

        }
      );
    }
  }

  async registrarUsuario() {
    await this.getUserApp()
    let texto = 'registrar'
    Swal.fire({
      title: 'Alerta',
      text: '¿Está seguro que desea ' + texto + ' un usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#C81D11',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok(1)
      }
    })

  }

  validateUserForm(): boolean {
    if (this.iUser.login == '' || this.iUser.login == undefined) return false;
    if (this.iUser.cedula == '' || this.iUser.cedula == undefined) return false;
    if (this.iUser.nombre == '' || this.iUser.nombre == undefined) return false;
    if (this.iUser.descripcion == '' || this.iUser.descripcion == undefined) return false; // Cargo
    if (this.iUser.correo == '' || this.iUser.correo == undefined) return false;
    if (this.descripcion == '' || this.descripcion == undefined) return false; // Descripcion General
    return true;
  }



  validateEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.iUser.correo && this.iUser.correo.trim() !== '') {
      this.isEmailInvalid = !emailRegex.test(this.iUser.correo);
    } else {
      this.isEmailInvalid = false;
    }
  }

  /**
   * Check Password Strength
   * @param password 
   */
  checkPasswordStrength(password: string): void {
    let result = 0;
    if (password) {
      if (password.length >= 8) result += 20;
      if (password.match(/[A-Z]/)) result += 20;
      if (password.match(/[a-z]/)) result += 20;
      if (password.match(/[0-9]/)) result += 20;
      if (password.match(/[@$!%*?&]/)) result += 20;
    }

    this.passwordStrengthWidth = result;

    if (result < 40) {
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = 'bg-danger';
    } else if (result < 80) {
      this.passwordStrengthLabel = 'Media';
      this.passwordStrengthColor = 'bg-warning';
    } else if (result === 100) {
      this.passwordStrengthLabel = 'Fuerte';
      this.passwordStrengthColor = 'bg-success';
    } else {
      this.passwordStrengthLabel = 'Buena';
      this.passwordStrengthColor = 'bg-info';
    }
  }

  validatePassword() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (this.iUser.clave && !passwordRegex.test(this.iUser.clave)) {
      this.isPasswordInvalid = true;
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "La clave no cumple con los requisitos. Debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&).",
        5000
      );
    } else {
      this.isPasswordInvalid = false;
    }
  }


  consultarCedula() {
    this.xAPI.funcion = environment.functions.CONSULTAR_CEDULA
    this.xAPI.parametros = this.iUser.cedula
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          if (data.length > 0) {
            this.utilservice.AlertMini(
              'top-end',
              'warning',
              'Cédula ya se encuentra registrado',
              3000
            )
            this.iUser.cedula = ''
          }
        }

      },
      (error) => {
        console.log(error)
      }
    )
  }

  consultarLogin() {
    this.xAPI.funcion = environment.functions.CONSULTAR_LOGIN
    this.xAPI.parametros = this.iUser.login
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          if (data.length > 0) {
            this.utilservice.AlertMini(
              'top-end',
              'warning',
              'Login ya se encuentra registrado',
              3000
            )
            this.iUser.login = ''
          }
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ngOnDestroy(): void {
    window.sessionStorage.removeItem('validator')
  }


}
