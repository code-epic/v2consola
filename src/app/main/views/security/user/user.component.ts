import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { ApiService, IAPICore } from "@services/apicore/api.service";

import { Aplicacion, IUser } from "@services/seguridad/rol.service";
import {
  Firmadigital,
  Perfil,
  SAplicacion,
  SMenu,
  SPrivilegio,
  SRol,
  UserService,
  Usuario,
} from "@services/seguridad/user.service";
import { UtilService } from "@services/util/util.service";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";

import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { runInContext } from "vm";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class UserComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI("section-block") sectionBlockUI: NgBlockUI;

  public contentHeader: object;
  // @ViewChild('dataUsers') dataUsers: any

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public basicSelectedOption: number = 10;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  };

  public Perfil: Perfil = {
    descripcion: "",
    traza: "",
  };
  public usuario: Usuario = {
    cedula: "",
    nombre: "",
    login: "",
    correo: "",
    clave: "",
    sucursal: "",
    direccion: "",
    cargo: "",
    telefono: "",
    sistema: "",
    token: "",
    estatus: 1,
    Perfil: this.Perfil,
    Aplicacion: [],
    firmadigital: undefined,
    endpoint: "",
  };

  public iUser: IUser = {
    cedula: "",
    tipoacceso: 0,
    respaldo: 0,
    endpoint: "",
    login: "",
    clave: "",
    encriptamiento: "",
    nombre: "",
    descripcion: "",
    estatus: 1,
    vigencia: 180,
    correo: "",
    observaciones: "",
    duraciontexto: 1,
    duraciontiempo: 5,
    oficina: "",
    regional: "",
  };

  public tipoacceso = [
    { id: 0, name: "SELECCIONAR" },
    { id: 1, name: "LOCAL" },
    { id: 2, name: "LDAP" },
    { id: 3, name: "DIRECTORIO ACTIVO" },
    { id: 4, name: "OTRO" },
  ];

  public respaldo = [
    { id: 1, name: "SI" },
    { id: 0, name: "NO" },
  ];

  public estatus = [
    { id: 1, name: "ACTIVO" },
    { id: 0, name: "INACTIVO" },
  ];

  public formato = [
    { id: "1", name: "SHA256" },
    { id: "2", name: "MD5" },
  ];

  public duracion = [
    { id: 1, name: "Segundos" },
    { id: 60, name: "Minutos" },
    { id: 3600, name: "Horas" },
  ];

  public sesion = [
    { id: 30, name: "30 días" },
    { id: 60, name: "60 días" },
    { id: 90, name: "90 días" },
    { id: 180, name: "180 días" },
  ];

  public traza = [
    { id: "1|BAJA", name: "BAJA" }, //CONEXIONES
    { id: "2|MEDIA", name: "MEDIA" }, //CONEXION - PETIONES ACCIONES I,U,R,D
    { id: "3|ALTA", name: "ALTA" }, //CONEXION - PETIONES ACCIONES I,U,R,D / SELECT CAPTURAR
  ];

  public Rol: SRol = {
    descripcion: "",
    Menu: [],
  };

  public Menu: SMenu = {
    url: "",
    js: "",
    icono: "",
    descripcion: "",
    nombre: "",
    accion: "",
    clase: "",
    color: "",
    Privilegio: [],
    SubMenu: [],
  };

  public Aplicacion: SAplicacion = {
    id: "",
    nombre: "",
    url: "",
    comentario: "",
    version: "",
    autor: "",
    Rol: {
      descripcion: "",
      Menu: [],
    },
  };

  public ldap: boolean = false;
  public activedirectory = false;
  public property = false;
  public tiempoduracion = "0";
  public lstAplicacion = [];
  public Privilegios: SPrivilegio = {
    metodo: "",
    descripcion: "",
    accion: "",
    directivas: "",
    endpoint: "",
    funcion: "",
  };

  public lstPerfil = [];
  public dataUsers = [];
  public lstUsersApp = [];
  public temprowData = [];

  public xaplicacion = "";
  public xperfil = "";
  public xtraza = "1|BAJA";

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private userService: UserService
  ) {
    this.userService.iniciarObjeto();

    // this.Rol.descripcion = "Descripcion general"
    // this.Rol.Menu.push(this.Menu)

    // this.Aplicacion.Rol = this.Rol
    // userService.Aplicacion.push(this.Aplicacion)
    // console.log(userService.toJSON())
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
    this.CargarListaAplicaciones();
  }

  selDuracion(e) {
    console.log(e);
    if (e == 3) {
      this.tiempoduracion = "0";
    }
  }

  selTipoAcceso(e) {
    switch (e) {
      case 1:
        this.property = true;
        this.ldap = false;
        break;
      case 2:
        this.property = false;
        this.ldap = true;
        break;
      case 3:
        this.property = false;
        this.ldap = true;
        break;
      default:
        this.property = false;
        this.ldap = false;
        this.activedirectory = false;
        break;
    }
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = "";
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicacion = data.Cuerpo.map((e) => {
          e.id = e.identificador + "|" + e.nombre;
          e.name = e.nombre + " : " + e.VERSION;
          return e;
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selPerfil(e) {
    try {
      let codPerfil = e.split("|")[0].toString();
      //this.obtenerAplicacion(e)
      // this.obetnerModulos(codPerfil, e)
      this.xAPI.funcion = "_SYS_CPerfilesAPP";
      this.xAPI.parametros = codPerfil;
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.lstPerfil = data.Cuerpo.map((e) => {
            e.id = e.id + "|" + e.perfil;
            e.name = e.perfil;
            return e;
          });
          // console.log(this.lstPerfil)
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (error) {
      console.error("Errores varios: ", error);
    }
  }

  //OBTENER LA LISTA DE LOS MENU Y ACCIONES DESDE EL PERFIL
  async obetnerModulos(apps) {
    this.xAPI.funcion = "_SYS_CModulosAPP";
    this.xAPI.parametros = `${apps.idapp},${apps.idper}`;

    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        let lstMenu = [];
        data.Cuerpo.forEach((e) => {
          if (e.menu_acciones != undefined) {
            let menu = JSON.parse(e.menu_acciones);
            if (menu.acciones != undefined) {
              let lstPriv = [];
              menu.acciones.forEach((obj) => {
                let Privilegios = {
                  accion: obj.accion,
                  directivas: obj.directiva,
                  funcion: obj.funcion,
                  endpoint: obj.endpoint,
                };
                lstPriv.push(Privilegios);
              });
              let Menu = {
                url: menu.url,
                icono: menu.icono,
                color: menu.color,
                nombre: menu.nombre,
                js: menu.js,
                clase: menu.clase,
                SubMenu: {},
                Privilegio: lstPriv,
              };
              lstMenu.push(Menu);
            }
          }
        });
        this.obtenerAplicacion(apps, lstMenu);
        // return lstMenu
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async obtenerAplicacion(apps, Menu: any) {
    let lstApp = [];

    // let lstrol: any = []
    let rol: SRol = {
      descripcion: "XX-00",
      Menu: Menu,
    };
    // lstrol.push(rol)
    let xapps: SAplicacion = {
      autor: apps.creador,
      id: apps.id,
      nombre: apps.nombre,
      version: apps.version,
      url: apps.repositorio,
      comentario: "",
      Rol: rol,
    };
    this.Aplicacion = xapps;
    lstApp.push(this.Aplicacion);
    this.usuario.Perfil.descripcion = apps.perfil;
    this.usuario.Perfil.traza = apps.traza;
    this.usuario.cedula = this.iUser.cedula;
    this.usuario.login = this.iUser.login;
    this.usuario.nombre = this.iUser.nombre;
    this.usuario.correo = this.iUser.correo;
    this.usuario.endpoint = this.iUser.endpoint;
    this.usuario.clave = await this.utilservice.generateSHA256Hash(
      this.iUser.clave
    );
    //  console.log(this.iUser.vigencia)
    let firma: Firmadigital = {
      vigencia: this.iUser.vigencia,
      duracion: this.iUser.duraciontiempo * this.iUser.duraciontexto,
      direccionmac: "",
      direccionip: "",
      tiempo: "",
      nivel: 0,
    };
    this.usuario.firmadigital = firma;
    this.usuario.sistema = apps.aplicacion; //this.xaplicacion.split("|")[1].toString()
    this.usuario.Aplicacion = lstApp;

    // console.log(this.usuario)
  }

  async agregarAplicacion() {
    let app = {};
    if (
      this.xaplicacion == "" ||
      this.xperfil == "" ||
      this.xtraza == undefined
    ) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "Debe verificar los campos",
        3000
      );
      return false;
    }
    this.lstAplicacion.forEach((e) => {
     
      if (e.id == this.xaplicacion) {
        app = {
          id: e.id,
          iduser: 0,
          idapp: this.xaplicacion.split("|")[0],
          aplicacion: this.xaplicacion.split("|")[1],
          idper: this.xperfil.split("|")[0],
          perfil: this.xperfil.split("|")[1],
          idtra: this.xtraza.split("|")[0],
          traza: this.xtraza.split("|")[1],
          estatus: 1,
          repositorio: e.repositorio,
          version: e.VERSION,
          creador: e.creador,
          autor: e.name,
          comentario: e.observacion,
        };
      }
    });

    this.lstUsersApp.push(app);
    console.log(this.lstUsersApp);
    this.lstPerfil = [];
    this.xaplicacion = "";
    this.xperfil = "";
    this.dataUsers = this.lstUsersApp;
  }

  quitarElemento(i) {
    console.log(i);
  }

  verPerfil() {}

  eliminarPerfil() {}

  agregarUsuario() {
    this.lstUsersApp.forEach((e) => {
      this.obetnerModulos(e);
    });
    console.log(this.usuario);
  }

  cancelar() {}
}



// {
//   "_id": {
//     "$oid": "6533d53960d3d0bef3a985f1"
//   },
//   "cedula": "bdv2022",
//   "nombre": "Administrador",
//   "login": "conformacion",
//   "correo": "",
//   "clave": "393a9f8b0b9d1b751bffbe860fe18d19f0639cbae7bc42123f187cf7f5187322",
//   "sucursal": "Principal",
//   "direccion": "Principal",
//   "cargo": "Administrador",
//   "telefono": "",
//   "sistema": "gdoc.proccedings",
//   "token": "Autorizado",
//   "Perfil": {
//     "descripcion": "Entrada"
//   },
//   "Aplicacion": [
//     {
//       "id": "ID-001",
//       "nombre": "Gestion de Documentos",
//       "url": "http://localhost/bdv",
//       "comentario": "Sistema de Seguimiento de Credito",
//       "version": "V1.0.0.0",
//       "autor": "Code-Epic Technologies",
//       "Rol": {
//         "descripcion": "Usuario Sistema",
//         "Menu": [
//           {
//             "url": "/principal",
//             "js": "",
//             "icono": "icon-bdv-bank-l",
//             "descripcion": "Principal",
//             "nombre": "Principal",
//             "accion": "",
//             "clase": "text-primary",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/aprobado",
//             "js": "",
//             "icono": "icon-bdv-location-l",
//             "descripcion": "Aprobación",
//             "nombre": "Aprobacion",
//             "accion": "",
//             "clase": "text-orange",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/tareaspendientes",
//             "js": "",
//             "icono": "icon-bdv-location-l",
//             "descripcion": "En Seguimiento",
//             "nombre": "En Seguimiento",
//             "accion": "",
//             "clase": "text-green",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/recibidos",
//             "js": "",
//             "icono": "icon-bdv-mail-l",
//             "descripcion": "Recibidos",
//             "nombre": "Recibidos",
//             "accion": "",
//             "clase": "text-primary",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/conformacionusuario",
//             "js": "",
//             "icono": "icon-bdv-location-l",
//             "descripcion": "Conformacion Usuario",
//             "nombre": "Conformacion Usuario",
//             "accion": "",
//             "clase": "text-orange",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/conformacion",
//             "js": "",
//             "icono": "icon-bdv-location-l",
//             "descripcion": "Conformacion",
//             "nombre": "Conformacion",
//             "accion": "",
//             "clase": "text-orange",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": [
//               {
//                 "url": "/cranalisis",
//                 "js": "",
//                 "descripcion": "Por Analizar",
//                 "icono": "fa fa-plus-circle",
//                 "nombre": "Registrados",
//                 "accion": "CargarUrl('negocio', 'neregistrar')",
//                 "clase": "f-left",
//                 "color": "bg-c-green",
//                 "Privilegios": [
//                   {
//                     "metodo": "aceptar",
//                     "descripcion": "Registrados",
//                     "accion": "Registrados()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "rechazar",
//                     "descripcion": "Clasificacion",
//                     "accion": "Clasificacion()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "extender",
//                     "descripcion": "Clasificacion",
//                     "accion": "Clasificacion()",
//                     "directivas": ""
//                   }
//                 ]
//               },
//               {
//                 "url": "/crdocumentar",
//                 "js": "",
//                 "descripcion": "Por Documentar",
//                 "icono": "fa fa-plus-circle",
//                 "nombre": "Documentar",
//                 "accion": "CargarUrl('negocio', 'neregistrar')",
//                 "clase": "f-left",
//                 "color": "bg-c-green",
//                 "Privilegios": [
//                   {
//                     "metodo": "aprobador",
//                     "descripcion": "Enviar a Legal",
//                     "accion": "sendLayer()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "rechazar",
//                     "descripcion": "Enviar a Negocio",
//                     "accion": "sendBusines()",
//                     "directivas": ""
//                   }
//                 ]
//               }
//             ]
//           },
//           {
//             "url": "/seguimiento",
//             "js": "",
//             "icono": "icon-bdv-file-l ",
//             "descripcion": "Reportes",
//             "nombre": "Reportes",
//             "accion": "",
//             "clase": "text-pink",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           },
//           {
//             "url": "/administracion",
//             "js": "",
//             "icono": "icon-bdv-config-l",
//             "descripcion": "Configurar",
//             "nombre": "Configurar",
//             "accion": "",
//             "clase": "text-blue",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": [
//               {
//                 "url": "/neregistrar",
//                 "js": "",
//                 "descripcion": "Registro",
//                 "icono": "fa fa-plus-circle",
//                 "nombre": "Registrados",
//                 "accion": "CargarUrl('negocio', 'neregistrar')",
//                 "clase": "f-left",
//                 "color": "bg-c-green",
//                 "Privilegios": [
//                   {
//                     "metodo": "registrados",
//                     "descripcion": "Registrados",
//                     "accion": "Registrados()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "clasificacion",
//                     "descripcion": "Clasificacion",
//                     "accion": "Clasificacion()",
//                     "directivas": ""
//                   }
//                 ]
//               },
//               {
//                 "url": "/neconsultar",
//                 "js": "",
//                 "descripcion": "Consultar",
//                 "icono": "fa fa-inbox",
//                 "nombre": "Consultar",
//                 "accion": "CargarUrl('negocio', 'neconsultar')",
//                 "clase": "f-left",
//                 "color": "bg-c-blue",
//                 "Privilegios": [
//                   {
//                     "metodo": "aprobadas",
//                     "descripcion": "Aprobadas",
//                     "accion": "Aprobadas()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "rechazadas",
//                     "descripcion": "Rechazar",
//                     "accion": "Rechazar()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "anular",
//                     "descripcion": "Pendientes",
//                     "accion": "Pendientes()",
//                     "directivas": ""
//                   }
//                 ]
//               },
//               {
//                 "url": "/exactualizar",
//                 "js": "",
//                 "descripcion": "Actualizar",
//                 "icono": "fa fa-share",
//                 "nombre": "Actualizar",
//                 "accion": "CargarUrl('expedientes', 'actualizar')",
//                 "clase": "f-left",
//                 "color": "bg-c-pink",
//                 "Privilegios": [
//                   {
//                     "metodo": "registrados",
//                     "descripcion": "Registrados",
//                     "accion": "Registrados()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "clasificacion",
//                     "descripcion": "Clasificacion",
//                     "accion": "Clasificacion()",
//                     "directivas": ""
//                   }
//                 ]
//               },
//               {
//                 "url": "/exprestamos",
//                 "js": "",
//                 "descripcion": "Prestamos",
//                 "icono": "fa fa-envelope-open",
//                 "nombre": "Prestamos",
//                 "accion": "CargarUrl('expedientes', 'prestamos')",
//                 "clase": "f-left",
//                 "color": "bg-purple",
//                 "Privilegios": [
//                   {
//                     "metodo": "alertas",
//                     "descripcion": "Alerta",
//                     "accion": "Alerta()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "pendientes",
//                     "descripcion": "Pendientes",
//                     "accion": "Pendientes()",
//                     "directivas": ""
//                   }
//                 ]
//               },
//               {
//                 "url": "/exinactivar",
//                 "js": "",
//                 "descripcion": "Inactivar",
//                 "icono": "fa fa-share",
//                 "nombre": "Inactivar",
//                 "accion": "CargarUrl('expedientes', 'inactivar')",
//                 "clase": "f-left",
//                 "color": "bg-c-pink",
//                 "Privilegios": [
//                   {
//                     "metodo": "registrados",
//                     "descripcion": "Registrados",
//                     "accion": "Registrados()",
//                     "directivas": ""
//                   },
//                   {
//                     "metodo": "clasificacion",
//                     "descripcion": "Clasificacion",
//                     "accion": "Clasificacion()",
//                     "directivas": ""
//                   }
//                 ]
//               }
//             ]
//           },
//           {
//             "url": "/seguridad",
//             "js": "",
//             "icono": "icon-bdv-unknowsecure-l ",
//             "descripcion": "Seguridad",
//             "nombre": "Seguridad",
//             "accion": "",
//             "clase": "text-pink",
//             "color": "",
//             "Privilegio": [],
//             "SubMenu": []
//           }
//         ]
//       }
//     }
//   ],
//   "firmadigital": {
//     "direccionmac": "*",
//     "direccionip": "*",
//     "tiempo": "2022-08-01T19:07:05.851Z"
//   }
// }