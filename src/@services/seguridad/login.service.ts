import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { TaskService } from "@services/apicore/task.service";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { UtilService } from "@services/util/util.service";
import { SessionService } from "@services/util/session.service";

import { Md5 } from "ts-md5";
import Swal from "sweetalert2";
import jwt_decode from "jwt-decode";
import { Sha256Service } from "@services/util/sha256";

export interface IUsuario {
  nombre: string;
  cedula: string;
  tipo: string;
  componente: string;
  clave: string;
  correo: string;
}

export interface IToken {
  token: string;
}

export interface UClave {
  login: string;
  clave: string;
  nueva: string;
  repetir: string;
  correo: string;
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
  providedIn: "root",
})
export class LoginService {
  //Dirección Get para servicios en la página WEB
  public URL: string = environment.API;

  public Id: string = "";

  public SToken: any;

  public Token: any;

  public Usuario: any;

  public Aplicacion: any;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  urlGet = "";

  constructor(
    private router: Router,
    private utils: UtilService,
    private http: HttpClient,
    private taskService: TaskService,
    private sha256: Sha256Service,
    private apiService: ApiService,
    private sessionService: SessionService,
  ) {
    this.urlGet = environment.API;
    this.Id = environment.ID;
  }

  async Iniciar(itk: string) {
    this.Token = await this.getUserDecrypt(itk);
    sessionStorage.setItem("token", itk);
    this.obenterAplicacion(itk);
  }

  getLogin(user: string, clave: string): Observable<IToken> {
    const netInfo = sessionStorage.getItem("net_info");
    let deviceContext = "";

    if (netInfo) {
      const info = JSON.parse(netInfo);
      const context = {
        os_info: info.system?.os_info || "unknown",
        mac_address: info.system?.mac_address || "unknown",
        network: info.network || "unknown",
      };
      deviceContext = btoa(JSON.stringify(context));
    }
    // console.log('Device Context:', deviceContext);

    return from(
      this.sha256.EncryptDeviceContext(
        deviceContext,
        environment.Hash.slice(-32),
      ),
    ).pipe(
      switchMap((encodeDeviceContext) => {
        const timestamp = new Date().getTime().toString();
        const httpOptions = {
          headers: new HttpHeaders({
            "X-Skip-Interceptor": "true",
            "Content-Type": "application/json",
            "X-Device-Context": encodeDeviceContext,
            "X-Timestamp": timestamp,
            "Web-API-key": environment.Hash,
          }),
        };

        var usuario = {
          nombre: user,
          clave: clave,
        };
        var url = this.urlGet + "wusuario/loginV2";
        return this.http.post<IToken>(url, usuario, httpOptions);
      }),
    );
  }

  getCrear(user: string, clave: string): Observable<IToken> {
    var usuario = {
      nombre: user,
      clave: clave,
    };
    var url = this.urlGet + "wusuario/crear";
    // console.info(url)
    return this.http.post<IToken>(url, usuario);
  }

  makeUser(user: IUsuario): Observable<any> {
    var url = this.urlGet + "identicacion";
    return this.http.post<any>(url, user);
  }

  logout() {
    Swal.fire({
      title: "¿Desea cerrar sesión?",
      text: "Gracias por su tiempo",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, cerrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(["/miscellaneous/logout"]);
      }
    });
  }

  /**
   * Orquesta el proceso de cierre de sesión completo, notificando el progreso.
   * @param progressCallback Una función para reportar el progreso a la UI.
   */
  public async performLogoutProcess(
    progressCallback: (message: string) => void,
  ) {
    try {
      progressCallback("Cerrando conexiones en tiempo real...");
      this.sessionService.closeConnection();

      progressCallback("Finalizando sesión en el servidor...");
      await this.utils.sleep(800); // Pequeña pausa para UX
      const httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        }),
      };
      const url =
        this.urlGet + "wusuario/logout:" + localStorage.getItem("userId");
      await this.http.post(url, {}, httpOptions).toPromise();
    } catch (error) {
      console.error(
        "Error al contactar el servidor para logout (se procederá con la limpieza local):",
        error,
      );
      progressCallback(
        "No se pudo contactar al servidor, limpiando localmente...",
      );
      await this.utils.sleep(1500);
    } finally {
      progressCallback("Limpiando datos de la sesión...");
      await this.utils.sleep(800); // Pequeña pausa para UX
      await this.clearSession();

      progressCallback("¡Hasta pronto!");
      await this.utils.sleep(1200); // Pequeña pausa para que el usuario lea el mensaje final.
      this.router.navigate(["/"]);
    }
  }

  /**
   * Guarda las tareas pendientes y limpia el almacenamiento local y de sesión.
   * Es async para asegurar que los pasos se completen antes de continuar.
   */
  async clearSession(): Promise<void> {
    try {
      const lst = await this.taskService.keys();
      if (lst && lst.length > 0) {
        const lstApp = [];
        for (const e of lst) {
          const data = await this.taskService.get(e);
          if (data.estatus) {
            lstApp.push(data);
          }
        }
        if (lstApp.length > 0) {
          // Convertimos el Observable a Promesa para usar await
          await this.insertCommitDB(lstApp).toPromise();
        }
      }
    } catch (error) {
      console.error(
        "Error guardando tareas pendientes durante el logout:",
        error,
      );
      // No bloqueamos el logout si esto falla, solo lo registramos.
    } finally {
      // Esto SIEMPRE debe ejecutarse para garantizar el cierre de sesión en el cliente.

      sessionStorage.clear();
      localStorage.clear();
      await this.taskService.clear();
    }
  }

  insertCommitDB(lst): Observable<any> {
    let idUser = "panel";

    let obj = {
      usuario: idUser,
      task: lst,
      fecha: new Date(),
    };
    let cl = {
      coleccion: environment.colecciones.USER_TASK,
      driver: environment.driver.PRINCIPAL,
      objeto: obj,
      donde: '{\"usuario\":\"' + idUser + '\"}',
      upsert: true,
    };

    return this.apiService.ExecColeccion(cl);
  }

  getUserDecrypt(itk: string) {
    if (!itk || itk === 'undefined' || itk === 'null') {
      return null;
    }
    try {
      var t = jwt_decode(itk);
      return t;
    } catch (error) {
      console.error('Error decodificando token en getUserDecrypt:', error);
      return null;
    }
  }

  //ObenterAplicacion
  public async obenterAplicacion(itk: string) {
    await this.utils.sleep(800); // Pequeña pausa para UX
    let cadena =
      this.Token.Usuario.cedula +
      "," +
      this.Token.Usuario.sistema +
      "," +
      this.Token.Usuario.correo;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.CONSULTAR_USUARIO_PERFIL;
    this.xAPI.parametros = cadena;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        try {
          // Verificamos que la data y las propiedades anidadas existan antes de usarlas
          if (
            !data ||
            data.length === 0 ||
            !data[0].Aplicacion ||
            data[0].Aplicacion.length === 0 ||
            !data[0].Aplicacion[0].Rol
          ) {
            throw new Error(
              "La respuesta del perfil de usuario no es válida o está vacía.",
            );
          }

          sessionStorage.setItem(
            "menu",
            JSON.stringify(data[0].Aplicacion[0].Rol.Menu),
          );
          let texto = Md5.hashStr(
            JSON.stringify(data[0].Aplicacion[0].Rol.Menu),
          );

          this.utils.uuidv4();

          sessionStorage.setItem("crypt", texto);
          this.router.navigate(["home"]).then(() => {
            window.location.reload();
          });
        } catch (e) {
          console.error("Error al procesar el perfil del usuario:", e);
          Swal.fire({
            title: "Error de Perfil",
            text: "No se pudo cargar la configuración de su perfil. Por favor, contacte al administrador.",
            icon: "error",
          });
          sessionStorage.clear();
          localStorage.clear();
        }
      },
      (error) => {
        sessionStorage.clear();
        localStorage.clear();
        // this.router.navigate(["/login"]).then(() => {
        //   window.location.reload();
        // });
        console.error("Fallo conectando al perfil del usuario: ", error);
      },
    );
  }
}
