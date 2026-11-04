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
import { CoreMenuService } from "@core/components/core-menu/core-menu.service";
import { CoreConfigService } from "@core/services/config.service";
import { aplicacion } from "app/menu/schema";

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
    private coreMenuService: CoreMenuService,
    private coreConfigService: CoreConfigService,
  ) {
    this.urlGet = environment.API;
    this.Id = environment.ID;
  }

  async Iniciar(
    itk: string,
    onProgress?: (msg: string, pct: number) => void,
  ): Promise<boolean> {
    this.Token = await this.getUserDecrypt(itk);
    sessionStorage.setItem("token", itk);
    return this.obenterAplicacion(itk, onProgress);
  }

  getLogin(user: string, clave: string, captchaData?: any): Observable<IToken> {
    const netInfo = sessionStorage.getItem("net_info");
    let deviceContext = "";

    if (netInfo) {
      try {
        const info = JSON.parse(netInfo);
        const context = {
          os_info: info.system?.os_info || "unknown",
          mac_address: info.system?.mac_address || "unknown",
          network: info.network || "unknown",
        };
        deviceContext = btoa(JSON.stringify(context));
      } catch (e) {
        console.warn("[LoginService] Error parseando net_info:", e);
      }
    }

    const timestamp = new Date().getTime().toString();
    const usuario: any = {
      nombre: user,
      clave: clave,
      ...(captchaData
        ? {
            sol: captchaData.sol,
            sig: captchaData.sig,
            signature: captchaData.sig,
            salt: captchaData.salt,
            challenge: captchaData.challenge,
          }
        : {}),
    };
    const url = this.urlGet + "wusuario/loginV2";

    // Fallback: si falla la criptografía (crypto.subtle no disponible),
    // hacemos el POST sin X-Device-Context (el servidor lo tolera)
    const cryptoPromise = this.sha256
      .EncryptDeviceContext(deviceContext, environment.Hash.slice(-32))
      .catch((cryptoErr) => {
        console.warn(
          "[LoginService] crypto.subtle falló, continuando sin device context:",
          cryptoErr,
        );
        return "";
      });

    const httpOptions = (ctx: string) => {
      const headers: any = {
        "X-Skip-Interceptor": "true",
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "Web-API-key": environment.Hash,
      };
      if (ctx) headers["X-Device-Context"] = ctx;
      return { headers: new HttpHeaders(headers) };
    };

    return from(cryptoPromise).pipe(
      switchMap((ctx) =>
        this.http.post<IToken>(url, usuario, httpOptions(ctx)),
      ),
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
      text: "La sesión actual de la consola será finalizada de forma segura.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, cerrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
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
    if (!itk || itk === "undefined" || itk === "null") {
      return null;
    }
    try {
      var t = jwt_decode(itk);
      return t;
    } catch (error) {
      console.error("Error decodificando token en getUserDecrypt:", error);
      return null;
    }
  }

  /**
   * Construye la estructura de navegación de CoreMenu a partir de los datos del backend
   */
  public buildMenu(rawMenu: any[]): any[] {
    const normalizeUrl = (u: string) => {
      if (!u) return '';
      const trimmed = u.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    };

    const schemaMenu = (aplicacion && aplicacion[0]?.Rol?.Menu) || [];

    return (rawMenu || []).map((e) => {
      let rawSubs: any = e.SubMenu || e.submenu || e.children || e.sub_menu || [];
      if (typeof rawSubs === 'string' && rawSubs.trim() !== '') {
        try {
          rawSubs = JSON.parse(rawSubs);
        } catch {
          rawSubs = [];
        }
      }
      if (!Array.isArray(rawSubs)) {
        rawSubs = [];
      }

      const isCollapsible =
        e.clase === 'collapsible' ||
        rawSubs.length > 0 ||
        (e.tipo === 'collapsible');

      // Si es colapsable pero viene sin submenús en el perfil remoto, buscar los submenús por defecto en el esquema maestro
      if (isCollapsible && rawSubs.length === 0) {
        const titleKey = (e.nombre || e.descripcion || '').toLowerCase().trim();
        const fallbackSchema = schemaMenu.find((sm: any) =>
          (sm.nombre || sm.descripcion || '').toLowerCase().trim() === titleKey
        );
        if (fallbackSchema && Array.isArray(fallbackSchema.SubMenu) && fallbackSchema.SubMenu.length > 0) {
          rawSubs = fallbackSchema.SubMenu;
        }
      }

      const item: any = {
        id: (e.nombre || '').toLowerCase(),
        type: isCollapsible ? 'collapsible' : (e.clase || 'item'),
        icon: e.icono || 'grid',
        translate: '',
        title: e.descripcion || e.nombre,
        url: isCollapsible ? '' : normalizeUrl(e.url || e.descripcion || ''),
      };

      if (Array.isArray(rawSubs) && rawSubs.length > 0) {
        item.children = rawSubs.map((el: any) => {
          return {
            id: (el.nombre || '').toLowerCase(),
            title: el.descripcion || el.nombre,
            type: el.clase || 'item',
            icon: el.icono || 'circle',
            url: normalizeUrl(el.url || el.descripcion || ''),
            externalUrl: el.externalUrl || false,
            openInNewTab: el.openInNewTab || false,
          };
        });
        item.url = '';
      }
      return item;
    });
  }

  // ObenterAplicacion sin window.location.reload()
  public obenterAplicacion(
    itk: string,
    onProgress?: (msg: string, pct: number) => void,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress("Consultando perfil y permisos...", 40);

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
        async (data) => {
          try {
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

            const rawMenu = data[0].Aplicacion[0].Rol.Menu;
            sessionStorage.setItem("menu", JSON.stringify(rawMenu));
            const texto = Md5.hashStr(JSON.stringify(rawMenu));
            this.utils.uuidv4();
            sessionStorage.setItem("crypt", texto);

            if (onProgress)
              onProgress("Configurando consola de seguridad...", 75);

            // Mapeo e inyección del menú en caliente sin recargar la página
            const mappedMenu = this.buildMenu(rawMenu);
            this.coreMenuService.register("main", mappedMenu);
            this.coreMenuService.setCurrentMenu("main");

            // Navegar directamente a home; la configuración del layout se restaura
            // limpiamente en el teardown (ngOnDestroy) del componente de login
            await this.router.navigate(["home"]);
            resolve(true);
          } catch (e) {
            console.error("Error al procesar el perfil del usuario:", e);
            Swal.fire({
              title: "Error de Perfil",
              text: "No se pudo cargar la configuración de su perfil. Por favor, contacte al administrador.",
              icon: "error",
            });
            sessionStorage.clear();
            localStorage.clear();
            reject(e);
          }
        },
        (error) => {
          sessionStorage.clear();
          localStorage.clear();
          console.error("Fallo conectando al perfil del usuario: ", error);
          reject(error);
        },
      );
    });
  }
}
