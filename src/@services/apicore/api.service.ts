import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { environment } from '../../environments/environment';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { UtilService } from '@services/util/util.service';
import { TaskService } from './task.service';

export interface RestoreAPI {
  nombre: string,
  ruta: string,
  user: string,
  pass: string,
  basedatos: string,
  coleccion: string,
  funcion: string
}

export interface IAPICore {
  id ?: string
  http ?: number
  https ?: number
  tipo ?: string
  distribucion ?: string
  aplicacion ?: string
  funcion ?: string
  version ?: string
  conexion ?: string
  categoria?: string
  funcionalidad?: string
  descripcion?: string
  metodo?: string
  relacional?: boolean
  coleccion?: string
  // nombre de tabla
  // tipo de dato
  // valor por defecto
  // condiciones
  //  nombre de campos
  //  alias
  // tipo de dato
  // esquema entrada
  // Consula SQL ? NO SQL
  parametros?: string
  valores?: any
  //  funciones prueba
  // agregar columna de la consula
  consumidores?: number
  cache?: number
  logs?: boolean
  concurrencia?: boolean
  retorna?: boolean
  // tiempo de duracion
  //  tipo de duracion
  prioridad?: string
  entorno?: string
  // waf
  accion?: boolean
  estatus?: boolean
  ruta?: string
// fin
  protocolo?: string
  migrar?: false
  modulo?: string
  puertohttp?: number
  puertohttps?: number
  driver?: string
  query?: string
  entradas?: string
  salidas?: string
  fecha?: string
  autor?: string
  totalizar?: string
  columnas?: string
  prefijo ?: string
}

export interface IAPI {
  id ?: string
  puertohttp : number
  puertohttps : number
  tipo : string
  distribucion : string
  aplicacion : string
  funcion : string
  version : string
  // conexion : string
  driver : string
  categoria: string
  funcionalidad: string
  descripcion: string
  metodo: string
  relacional: boolean
  coleccion: string
  // nombre de tabla
  // tipo de dato
  // valor por defecto
  // condiciones
  //  nombre de campos
  //  alias
  alias: string
  // tipo de dato
  // esquema entrada
  entradas: string
  // Consula SQL  NO SQL
  query: string
  parametros: string
  valores: any
  //  funciones prueba
  // agregar columna de la consula
  consumidores: number
  cache: number
  logs: boolean
  concurrencia: boolean
  retorna: boolean
  // tiempo de duracion
  //  tipo de duracion
  prioridad: string
  entorno: string
  // waf
  accion: boolean
  estatus: boolean
  ruta: string
  tiempoduracion : string
  tipoduracion: number
  // 
}


export interface WkfEstatus {
  estado: number;
  nombre: string;
  descripcion: string;
  estatus: number;
  orden: number;
}
export interface wkfTransicion {
  idw: number;
  funcion: string;
  parametro: string;
}

export interface DefinirMenu {
  id ?: number,
  nombre: string
  url: string
  js: string
  icon: string
  clase: string
  color: string
  tipo: number
  idmod: number
}

export interface AgregarAccion {
  endpoint: string
  nomb: string
  func: string
  direc: string
}

export interface AddModulo {
  nomb : string
  idapp: number
}

export interface AccionMenu {
  menuid: number
  accionid: number
}

export interface AddSubMenu {
  url: string
  js: string
  icon: string
  nomb: string
  clase: string
  color: string
  tipo: number
}

export interface wkfRed {
  idw : number, // Id WorkFlow
  nombre: string // Nombre de la Red
  tipo: number // Tipologia de la REd
  estatus: number // Estatus de la Red
  descripcion : string, // Descripcion
  estadoOrigen : number, // Estado de Origen
  estatusOrigen : number, // Estatus de Origen
  transicionVerdadero : number, // Transicion
  estadoDestinoVerdadero : number, // Estado de Destino Verdadero
  estatusDestinoVerdadero : number, // Estatus de Destino Verdadero
  estadoDestinoFalso : number, // Estado de Destino Falso
  estatusDestinoFalso : number, // Estatus de Destino Falso
  transicionFalsa: number,// Transicion de Error
  usuario: string // Usuario WKF
}

export interface WkfEstado {
  wkf: number;
  nombre: string;
  descripcion: string;
  estatus: number;
}

export interface ObjectoGenerico {
  idw: number,
  nomb: string,
  obse: string
}

export interface ProcessID {
  id : string,
  estatus: boolean,
  contenido ?: string,
  mensaje ?: string,
  segundos : string,
  rs ?: any
}

export interface WTipoArchivo {
  ruta	 ?:	string
	archivo	 ?:	string //CodeEncrypt
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //Dirección Get para servicios en la página WEB
  URL = environment.API;

  hash = ':c521f27fb1b3311d686d511b668e5bd4'

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    })
  };

  public pID : ProcessID = {
    id: '',
    estatus: false,
    mensaje: '',
    segundos: '',
    contenido: ''
  }

  constructor(
    private taskService: TaskService,
    private utilService: UtilService,
    private router: Router,
    private http: HttpClient,
    private ws: WsocketsService
    ) {

  }

  //EnviarArchivos generales
  EnviarArchivos(frm: FormData): Observable<any> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    return this.http.post<any>(this.URL + "subirarchivos", frm, httpOptions);
  }

  

  Guardar(xAPI: IAPICore, sApi: string): Observable<any> {

    var url = this.URL + sApi + this.hash;
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  Coleccion(xAPI: IAPICore, sApi: string): Observable<any> {

    var url = this.URL + sApi;
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  Listar(): Observable<any> {
    var url = this.URL + 'listar';
    return this.http.get<any>(url, this.httpOptions);
  }

  //Ejecutar Api generales
  Ejecutar(xAPI: IAPICore): Observable<any> {
    var url = this.URL + "crud" + this.hash;
    // if( xAPI.valores  != undefined ){
    //     xAPI.valores = JSON.parse(xAPI.parametros);
    // } 
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  //Ejecutar Api generales
  ExecFnx(fnx : any): Observable<any> {
    var url = this.URL + "fnx";
    return this.http.post<any>(url, fnx, this.httpOptions);
  }

  //  Consulta el PID de una funcion
  ExecFnxId(id: string): Observable<any> {
    var url = this.URL + `fnx:${id}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  // Consulta el Pid recursivamente
  ConsultarPidRecursivo(id:string, paquete:any){
    this.ExecFnxId(id).subscribe(
      (data) => {
        setTimeout(()=> {
          if(data.documento == 'PROCESADO'){
            this.pID.id = id
            this.pID.estatus = false
            this.pID.contenido = paquete
            this.ws.lstpid$.emit(this.pID)
          
          } else {
            this.ConsultarPidRecursivo(id, paquete)
          }
        },10000)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  DwsCdn(peticion : string){
    let ruta = this.URL + 'dwsother/' + peticion
    // console.log(ruta)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      responseType: 'blob' as 'json'
    };
    
    this.http.get(ruta, httpOptions).subscribe((response: any) => {
      const blob = new Blob([response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }


  getDwsCdn(tpf : WTipoArchivo) : Observable<any> {
    let ruta = this.URL + 'dwscdn'

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      responseType: 'blob' as 'json'
    };
    
    return this.http.post<any>(ruta,  tpf, httpOptions)
  }



  //ListarModulos
  ListarModulos(): Observable<any> {
    var url = this.URL + "lmodulos";
    return this.http.get<any>(url, this.httpOptions)
  }

  //ListarArchivos
  ListarArchivos(id: string): Observable<any> {
    var url = this.URL + "larchivos/" + id;
    return this.http.get<any>(url, this.httpOptions)
  }

  //ListarArchivos
  ProcesarArchivos(obj: any): Observable<any> {
    var url = this.URL + "phtml";
    return this.http.post<any>(url, obj, this.httpOptions)
  }


  GenerarCodigo(Entradas: string, funcion: string, ruta: string): string {
    if (Entradas == '') return 'Sin definicion'
    const json = JSON.parse(Entradas)
    var strI = '/*!\n'
    strI += '* Code Epic Technologies v1.0.1 (https://dev.code-epic.com)\n'
    strI += '* Copyright 2020-2022 CodeEpicTechnologies <http://code-epic.com>\n'
    strI += '* Licensed under MIT (https://code-epic.github.io)\n'
    strI += '*/\n'
    strI += 'export interface ' + funcion + ' {\n'
    json.forEach(value => {
      value.entradas.forEach(e => {
        strI += '\t' + e.alias + '\t ?:\t' + this.seleccionarTipo(e.tipo) + '\n'
      });
    });

    strI += '}\n'
    strI += 'this.xAPI.funcion = \'' + funcion + '\'\n'
    strI += 'this.xAPI.parametros = \'\'\n'
    strI += 'this.xAPI.valores = JSON.stringify(' + funcion + ')\n'
    strI += 'const url = \'' + ruta + '\'\n'
    strI += 'const api = http.post<any>(url, this.xAPI, httpOptions)\n'
    strI += 'api.subcribe(\n'
    strI += '\t(data) => {\n'
    strI += '\t\tconsole.info(data)\n'
    strI += '\t},\n'
    strI += '\t(error) => {\n'
    strI += '\t\tconsole.error(error)\n'
    strI += '\t}\n'
    strI += ')\n'
    return strI
  }

  seleccionarTipo(tipo: string): string {
    var c = ''
    switch (tipo) {
      case 'int':
        c = 'number'
        break;
      case 'sql':
        c = 'string'
        break;
      default:
        c = tipo
        break;
    }
    return c
  }
  /**
 * Ejecutar la coleccion
 * @param xObjeto Objeto Coleccion
 * @returns 
 */
  ExecColeccion(xObjeto): Observable<any> {
    var url = this.URL + "ccoleccion";
    return this.http.post<any>(url, xObjeto, this.httpOptions);
  }

  Mensaje(msj: string, txt: string, icono: SweetAlertIcon, destino: string): boolean {
    let respuesta = false
    Swal.fire({
      title: msj,
      text: txt,
      icon: icono,
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'No',
      allowEscapeKey: true,
    }).then((result) => {
      respuesta = result.isConfirmed
    })

    return respuesta
  }
}
