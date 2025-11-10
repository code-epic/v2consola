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

    await this.CargarListaAplicaciones()
    this.selTipoAcceso(3)
    this.iUser.encriptamiento = '1'



    this.cargarConfiguracionApp()




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
    });

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
        // console.log('Bajo control del enemigo',this.lstAplicacion)

        let usuario = window.sessionStorage.getItem('validator')


        if (usuario != undefined) {

          this.usuario = JSON.parse(usuario)
          // console.log(this.usuario)
          this.xaplicacion = this.usuario.sistema
          this.selPerfil(this.usuario.sistema)

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
          this.blockEdit = 'disabled'
          this.blockEditApp = 'disabled'
          let usuario = window.sessionStorage.getItem('validator')
          if (usuario != undefined) {
            if (!this.bEliminarAllProfile) {
             
              this.cargarUsuario(this.usuario)
              if (this.usuario.endpoint == undefined || this.usuario.endpoint == '') {
                this.iUser.tipoacceso = 1
                this.selTipoAcceso(1)
              }
            }else{
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
      // this.Aplicacion = xapps
      console.log(appx)
      lstApp.push(xapps)

    })




    this.usuario.Perfil.descripcion = apps.perfil
    this.usuario.Perfil.traza = apps.traza
    this.usuario.cedula = this.iUser.cedula
    this.usuario.login = this.iUser.login
    this.usuario.nombre = this.iUser.nombre
    this.usuario.descripcion = this.iUser.descripcion
    this.usuario.correo = this.iUser.correo
    this.usuario.cargo = this.iUser.descripcion
    this.usuario.observaciones = this.descripcion
    this.usuario.endpoint = this.iUser.endpoint
    this.usuario.sucursal = this.xoficina.name != undefined ? this.xoficina.name : this.xoficina
    this.usuario.direccion = this.xregional != undefined ? this.xregional.name : this.xregional


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
      duracion: this.iUser.duraciontiempo * this.iUser.duraciontexto,
      direccionmac: '',
      direccionip: '',
      tiempo: new Date().toISOString(),
      nivel: parseInt(apps.idtra),
    }
    this.usuario.firmadigital = firma
    this.usuario.sistema = apps.idapp.id
    this.usuario.Aplicacion = lstApp

    // console.log(this.usuario)
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

    // Usamos el método `some` que es más eficiente, ya que se detiene en cuanto encuentra una coincidencia.
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
    // console.log(`El estatus del elemento en el índice ${index} ha cambiado a: ${nuevoEstatus}`);
    // console.log('Estatus actual en dataUsers:', this.dataUsers[index].estatus);
    // console.log('Estatus actual en lstUsersApp:', this.lstUsersApp[index].estatus);
    this.dataUsers[index].estatus = nuevoEstatus ? 1 : 0
    this.dataUsers[index].tiempo = new Date().toISOString()

    this.lstUsersApp[index].estatus = nuevoEstatus ? 1 : 0
    this.lstUsersApp[index].tiempo = new Date().toISOString()

  }

  quitarElemento(i) {
    if (i !== -1) {
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
          this.lstUsersApp.splice(i, 1);

          if (this.dataUsers.length == 0) {
            this.blockEditApp = 'false'
            this.bEliminarAllProfile = true
          }

        }

      })
    }
  }

  verPerfil(profileData: any, modal: any) {
    this.profileData = profileData;
    // Aseguramos que las propiedades para expandir/contraer existan antes de abrir el modal.
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

  eliminarPerfil() { }

  async agregarUsuario() {

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

    console.log('usuario ', this.usuario)
    let fnx = {
      coleccion: 'usuario',
      objeto: this.usuario,
      donde: `{"cedula":"${this.usuario.cedula}"}`,
      driver: 'MGDBA',
      upsert: true,
    }

    this.apiService.ExecColeccion(fnx).subscribe(
      (data) => {
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

  finalizando() {
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
    window.sessionStorage.removeItem('validator')
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
          }
        }
      },
      (error) => {
        console.error('Error al cargar la configuración de la aplicación:', error);

      }
    );
  }


  SearchLoginLDAP() {
    // console.log(this.configuracion, this.isBDV)
    if (this.isBDV) {
      console.log(this.configuracion.endpoints.directorioActivo)
      let cod = {
        'codUsuario': this.iUser.login
      }

      let data = {
        'url': this.configuracion.endpoints.directorioActivo,
        'data': JSON.stringify(cod),
      }

      // console.log(data)
      this.apiService.SendRequestPostAnonimous(data).subscribe(
        (data) => {
          // console.log(data)
          if (data.usuario != null) {
            let usr = data.usuario

            this.iUser.cedula = usr.cedula
            // this.iUser.login = usr.login
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



  ngOnDestroy(): void {
    window.sessionStorage.removeItem('validator')

  }




}
