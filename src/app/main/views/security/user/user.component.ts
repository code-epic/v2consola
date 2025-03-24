import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';

import { IUser } from '@services/seguridad/rol.service';
import { SAplicacion, SMenu, SRol, UserService, Usuario } from '@services/seguridad/user.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';


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
  // @ViewChild('dataUsers') dataUsers: any

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public userJson: Usuario



  public iUser : IUser = {
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
    regional: ''
  }


  public tipoacceso = [
    { id: 0, name: 'SELECCIONAR' },
    { id: 1, name: 'LOCAL' },
    { id: 2, name: 'LDAP' },
    { id: 3, name: 'DIRECTORIO ACTIVO' },
    { id: 4, name: 'OTRO' },
  ]

  public respaldo = [
    { id: 1, name: 'SI' },
    { id: 0, name: 'NO' }
  ]


  public estatus = [
    { id: 1, name: 'ACTIVO' },
    { id: 0, name: 'INACTIVO' }
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

  public traza = [
    { id: '1|BAJA', name: 'BAJA' }, //CONEXIONES
    { id: '2|MEDIA', name: 'MEDIA' }, //CONEXION - PETIONES ACCIONES I,U,R,D
    { id: '3|ALTA', name: 'ALTA' } //CONEXION - PETIONES ACCIONES I,U,R,D / SELECT CAPTURAR
  ]

  public Rol: SRol = {
    descripcion: '',
    Menu: []
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
    Privilegio: [],
    SubMenu: []
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
      Menu: []
    },
  }

  public ldap : boolean = false
  public activedirectory = false
  public property = false
  public tiempoduracion = '0'
  public lstAplicacion = []
  public lstPerfil = []

  public dataUsers = []
  public lstUsersApp = []
  public temprowData = [] 

  public xaplicacion = ''
  public xperfil = ''
  public xtraza = '1|BAJA'

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private userService: UserService,
  ) { 

    this.userService.iniciarObjeto()
    
    this.Rol.descripcion = 'Descripcion general'
    this.Rol.Menu.push(this.Menu)

    this.Aplicacion.Rol = this.Rol
    userService.Aplicacion.push(this.Aplicacion)
    console.log(userService.toJSON())
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
    switch (e) {
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

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicacion = data.Cuerpo.map(e => {
          e.id = e.identificador + '|' + e.nombre 
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }


  selPerfil(e) {
    let codPerfil = e.split('|')[0].toString()
    this.obtenerAplicacion(e)
    this.obetnerModulos(codPerfil)

    this.xAPI.funcion = "_SYS_CPerfilesAPP";
    this.xAPI.parametros = codPerfil
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstPerfil = data.Cuerpo.map(e => {
          e.id = e.id + '|' + e.perfil
          e.name = e.perfil
          return e
        })
        console.log(this.lstPerfil)
      },
      (error) => {
        console.log(error)
      }
    )
  }


  //OBTENER LA LISTA DE LOS MENU Y ACCIONES DESDE EL PERFIL
  obetnerModulos(idPerfil){
    this.xAPI.funcion = "_SYS_CModulosAPP";
    this.xAPI.parametros = idPerfil
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
        console.log(e)
         if(e.menu_acciones != undefined){
          let menu = JSON.parse(e.menu_acciones)
          if( menu.acciones != undefined){
            menu.acciones.forEach(el => {
              console.log(e.Modulo, menu.nombre, el)
            });
          }
         }
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  obtenerAplicacion(id){
    this.lstAplicacion.forEach(e => {
      if(e.id = id){
        this.Aplicacion.autor = e.creador
        this.Aplicacion.id = e.id
        this.Aplicacion.nombre = e.nombre
        this.Aplicacion.version = e.VERSION
        this.Aplicacion.url = e.repositorio
      }
    })
  }

  agregarMenus(){
    console.log(this.lstAplicacion)

  }

  agregarAplicacion(){
    this.agregarMenus()

    if ( this.xaplicacion == "" || this.xperfil == '' || this.xtraza == undefined) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe verificar los campos', 3000)
      return false
    }
    let user = {
      'id' : null,
      'iduser' : 0,
      'idapp' : this.xaplicacion.split('|')[0],
      'aplicacion': this.xaplicacion.split('|')[1],
      'idper' : this.xperfil.split('|')[0],
      'perfil' : this.xperfil.split('|')[1],
      'idtra' : this.xtraza.split('|')[0],
      'traza' : this.xtraza.split('|')[1],
      'estatus' : 1
    }
    this.lstUsersApp.push(user)
    this.lstPerfil = []
    this.xaplicacion = ''
    this.xperfil = ''
    this.dataUsers = this.lstUsersApp
  }

  quitarElemento(i) {
    console.log(i)
  }

  verPerfil(){}

  eliminarPerfil(){

  }


  agregarUsuario(){

  }




  cancelar(){}
  
 




  







}