import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
//import { CodeEpic, Configuracion } from 'code.epic.module'
import jwt_decode from "jwt-decode";
import { TaskService } from '@services/apicore/task.service';
import { ApiService, IAPICore } from '@services/apicore/api.service';

import { Md5 } from 'ts-md5';
import { UtilService } from '@services/util/util.service';

export interface IUsuario {
  nombre: string,
  cedula: string,
  tipo: string,
  componente: string,
  clave: string,
  correo: string,
}

export interface IToken {
  token: string,
}

export interface UClave {
  login: string,
  clave: string,
  nueva: string,
  repetir: string,
  correo: string,
}


export interface Usuario {
  _id: ID;
  cedula: string;
  nombre: string;
  login: string;
  correo: string;
  clave: string;
  sucursal: string;
  direccion: string;
  cargo: string;
  telefono: string;
  sistema: string;
  token: string;
  Perfil: Perfil;
  Aplicacion: Aplicacion[];
  firmadigital: Firmadigital;
}

export interface Aplicacion {
  id: string;
  nombre: string;
  url: string;
  comentario: string;
  version: string;
  autor: string;
  Rol: Rol;
}

export interface Rol {
  descripcion: string;
  Menu: Menu[];
}

export interface Menu {
  url: string;
  js: string;
  icono: string;
  descripcion: string;
  nombre: string;
  accion: string;
  clase: string;
  color: string;
  Privilegio?: any[];
  SubMenu?: Menu[];
  Privilegios?: Privilegio[];
}

export interface Privilegio {
  metodo: string;
  descripcion: string;
  accion: string;
  directivas: string;
}

export interface Perfil {
  descripcion: string;
}

export interface ID {
  $oid: string;
}

export interface Firmadigital {
  direccionmac: string;
  direccionip: string;
  tiempo: Date;
}


@Injectable({
  providedIn: 'root'
})



export class LoginService {
  //Dirección Get para servicios en la página WEB
  public URL: string = environment.API

  public Id: string = ''

  public SToken: any

  public Token: any

  public Usuario: any

  public Aplicacion: any

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  urlGet = '';

  //public Epic: CodeEpic = new CodeEpic

  constructor(private router: Router, 
    private utils: UtilService,
    private http: HttpClient, 
    private taskService: TaskService, 
    private apiService: ApiService) {
    //environment.Url +
    this.urlGet = environment.API
    this.Id = environment.ID


  }

  async Iniciar(itk: string) {
    this.Token = await this.getUserDecrypt(itk)
    sessionStorage.setItem("token", itk);
    this.obenterAplicacion(itk)
  }

  getLogin(user: string, clave: string): Observable<IToken> {
    var usuario = {
      "nombre": user,
      "clave": clave,
    };
    // var url = this.urlGet + 'wusuario/login';
    var url = this.urlGet + 'wusuario/loginV2';
    // console.info(url)
    return this.http.post<IToken>(url, usuario);
  }

  getCrear(user: string, clave: string): Observable<IToken> {
    var usuario = {
      "nombre": user,
      "clave": clave,
    };
    var url = this.urlGet + 'wusuario/crear';
    // console.info(url)
    return this.http.post<IToken>(url, usuario);
  }

  makeUser(user: IUsuario): Observable<any> {
    var url = this.urlGet + 'identicacion';
    return this.http.post<any>(url, user);
  }

  logout() {
    Swal.fire({
      title: 'Desea cerrar sesión?',
      text: "Gracias por su tiempo!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(["/"])
        this.clearSession()


      }
    })
  }

  async clearSession() {
    let lstApp = []
    await this.taskService.keys().then(
      async lst => {
        let cnt = lst.length;
        for (let i = 0; i < cnt; i++) {
          const e = lst[i];
          this.taskService.get(e).then(
            data => {
              if (data.estatus) lstApp.push(data)
              if (i == cnt - 1) this.insertCommitDB(lstApp)
            }
          )

        }
      }
    )
    sessionStorage.clear();
    localStorage.clear();
  }



  insertCommitDB(lst) {
    let idUser = "panel"

    let obj = {
      "usuario": idUser,
      "task": lst,
      "fecha": new Date()
    }
    let cl = {
      'coleccion': environment.colecciones.USER_TASK,
      'driver': environment.driver.PRINCIPAL,
      'objeto': obj,
      'donde': '{\"usuario\":\"' + idUser + '\"}',
      'upsert': true
    }

    this.apiService.ExecColeccion(cl).subscribe(
      x => {
        this.taskService.clear()
      },
      e => {
        this.taskService.clear()
      }

    );
  }

  getUserDecrypt(itk: string) {
    var t = jwt_decode(itk)
    return t;
  }

  //ObenterAplicacion 
  protected obenterAplicacion(itk: string) {


    let cadena = this.Token.Usuario.cedula + ',' + this.Token.Usuario.sistema + ',' + this.Token.Usuario.correo
    this.xAPI.funcion = "_SYS_CUsuarioPerfil";
    this.xAPI.parametros = cadena
    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        try {
          // Verificamos que la data y las propiedades anidadas existan antes de usarlas
          if (!data || data.length === 0 || !data[0].Aplicacion || data[0].Aplicacion.length === 0 || !data[0].Aplicacion[0].Rol) {
            throw new Error("La respuesta del perfil de usuario no es válida o está vacía.");
          }


          sessionStorage.setItem("menu", JSON.stringify(data[0].Aplicacion[0].Rol.Menu));
          let texto = Md5.hashStr(JSON.stringify(data[0].Aplicacion[0].Rol.Menu));
          
          this.utils.uuidv4();

          sessionStorage.setItem("crypt", texto);
          this.router.navigate(["home"]).then(() => {
            window.location.reload();
          });
        } catch (e) {

          console.error('Error al procesar el perfil del usuario:', e);
          Swal.fire({
            title: 'Error de Perfil',
            text: 'No se pudo cargar la configuración de su perfil. Por favor, contacte al administrador.',
            icon: 'error'
          });
          sessionStorage.clear();
          localStorage.clear();
          // this.router.navigate(["/login"]).then(() => {
          //   window.location.reload();
          // });
        }

      },
      (error) => {
        sessionStorage.clear();
        localStorage.clear();
        // this.router.navigate(["/login"]).then(() => {
        //   window.location.reload();
        // });
        console.error('Fallo conectando al perfil del usuario: ', error)
      }
    )




  }




}
