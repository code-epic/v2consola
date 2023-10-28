import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
//import { CodeEpic, Configuracion } from 'code.epic.module'
import jwt_decode from "jwt-decode";
import { TaskService } from '@services/apicore/task.service';
import { ApiService } from '@services/apicore/api.service';
import { forEach } from 'lodash';

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
  _id:          ID;
  cedula:       string;
  nombre:       string;
  login:        string;
  correo:       string;
  clave:        string;
  sucursal:     string;
  direccion:    string;
  cargo:        string;
  telefono:     string;
  sistema:      string;
  token:        string;
  Perfil:       Perfil;
  Aplicacion:   Aplicacion[];
  firmadigital: Firmadigital;
}

export interface Aplicacion {
  id:         string;
  nombre:     string;
  url:        string;
  comentario: string;
  version:    string;
  autor:      string;
  Rol:        Rol;
}

export interface Rol {
  descripcion: string;
  Menu:        Menu[];
}

export interface Menu {
  url:          string;
  js:           string;
  icono:        string;
  descripcion:  string;
  nombre:       string;
  accion:       string;
  clase:        string;
  color:        string;
  Privilegio?:  any[];
  SubMenu?:     Menu[];
  Privilegios?: Privilegio[];
}

export interface Privilegio {
  metodo:      string;
  descripcion: string;
  accion:      string;
  directivas:  string;
}

export interface Perfil {
  descripcion: string;
}

export interface ID {
  $oid: string;
}

export interface Firmadigital {
  direccionmac: string;
  direccionip:  string;
  tiempo:       Date;
}


@Injectable({
  providedIn: 'root'
})



export class LoginService {
  //Dirección Get para servicios en la página WEB
  public URL : string =  environment.API
  
  public Id : string = ''
  
  public SToken : any

  public Token : any

  public Usuario : any

  public Aplicacion : any
  
  urlGet = '';

  //public Epic: CodeEpic = new CodeEpic

  constructor(private router: Router, private http: HttpClient, private taskService : TaskService, private apiService : ApiService) {
    //environment.Url +
    this.urlGet = environment.API;


  }

  async Iniciar() {
    await this.getUserDecrypt()
    return this.obenterAplicacion()
  }

  getLogin(user: string, clave: string): Observable<IToken> {
    var usuario = {
      "nombre": user,
      "clave": clave,
    };
    var url = this.urlGet + 'wusuario/login';
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
        Swal.fire(
          'Hasta la próxima!',
          'Te esperamos',
          'success'
        )
        this.clearSession()
        this.router.navigate(['login']);
        
      }
    })
  }

  async clearSession(){
    let lst = []
    await this.taskService.keys().then(
      data => {
        data.map(e => {
          console.log(e)
          this.taskService.get(e).then(
            contenido => {
              lst.push(contenido)
            }
          ) 
        }) 


        let cl = {
          'coleccion': 'user-task',
          'driver': 'MGDBA',
          'objeto': lst,
          'donde': '{"id":"panel"}',
          'upsert': true
        }

        this.apiService.ExecColeccion(cl).subscribe(
          x => {
            console.log('cone ', x)
            this.taskService.clear().then(
              xdata => {
    
              }
            )
          },
          e => {
            console.error(e)
          }

        );
      }
    )
    sessionStorage.clear();
    localStorage.clear();
  }

  getUserDecrypt() {
    var e = sessionStorage.getItem("token");
    var t = jwt_decode(sessionStorage.getItem('token'))
    var s = e.split(".");
    // return JSON.parse(atob(s[1]));
    return t;
  }

    //ObenterAplicacion 
    protected obenterAplicacion(){
      var Aplicacion = this.Token.Usuario.Aplicacion
      Aplicacion.forEach(e => {
        if(e.id == this.Id ){
          this.Aplicacion = e;
        }
      });
      return this.Aplicacion
    }
    
    obtenerMenu() : any {
      var i = 0
      return  this.Aplicacion.Rol.Menu.map(e => {
        e.id = e.url
        e.type = e.clase
        e.title = e.descripcion
        if(  e.SubMenu != undefined ) {
          e.children = e.SubMenu.map(el => {
            el.id =   el.url.replace('/', '-')
            el.title = el.descripcion
            el.type = el.clase
            el.url =  el.url
            return el
          }) 
          e.url = ''
        }
        return e
      }) 
      // return this.Aplicacion.Rol.Menu
    }
  
    obtenerSubMenu(idUrl : string) : any{   
      var App = this.Aplicacion
      var SubMenu = [] 
      App.Rol.Menu.forEach(e => {if (e.url == idUrl) SubMenu = e.SubMenu});
      return SubMenu
    }

}
