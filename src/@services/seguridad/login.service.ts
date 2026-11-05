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
      showDenyButton: false,
      confirmButtonText: "Si, cerrar",
      cancelButtonText: "No",
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
      if (!u) return "";
      const trimmed = u.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
        return trimmed;
      return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    };

    const schemaMenu = (aplicacion && aplicacion[0]?.Rol?.Menu) || [];

    return (rawMenu || []).map((e) => {
      let rawSubs: any =
        e.SubMenu || e.submenu || e.children || e.sub_menu || [];
      if (typeof rawSubs === "string" && rawSubs.trim() !== "") {
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
        e.clase === "collapsible" ||
        rawSubs.length > 0 ||
        e.tipo === "collapsible";

      // Si es colapsable pero viene sin submenús en el perfil remoto, buscar los submenús por defecto en el esquema maestro
      if (isCollapsible && rawSubs.length === 0) {
        const titleKey = (e.nombre || e.descripcion || "").toLowerCase().trim();
        const fallbackSchema = schemaMenu.find(
          (sm: any) =>
            (sm.nombre || sm.descripcion || "").toLowerCase().trim() ===
            titleKey,
        );
        if (
          fallbackSchema &&
          Array.isArray(fallbackSchema.SubMenu) &&
          fallbackSchema.SubMenu.length > 0
        ) {
          rawSubs = fallbackSchema.SubMenu;
        }
      }

      const item: any = {
        id: (e.nombre || "").toLowerCase(),
        type: isCollapsible ? "collapsible" : e.clase || "item",
        icon: e.icono || "grid",
        translate: "",
        title: e.descripcion || e.nombre,
        url: isCollapsible ? "" : normalizeUrl(e.url || e.descripcion || ""),
      };

      if (Array.isArray(rawSubs) && rawSubs.length > 0) {
        item.children = rawSubs.map((el: any) => {
          return {
            id: (el.nombre || "").toLowerCase(),
            title: el.descripcion || el.nombre,
            type: el.clase || "item",
            icon: el.icono || "circle",
            url: normalizeUrl(el.url || el.descripcion || ""),
            externalUrl: el.externalUrl || false,
            openInNewTab: el.openInNewTab || false,
          };
        });
        item.url = "";
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
              data[0].Aplicacion.length === 0
            ) {
              throw new Error(
                "La respuesta del perfil de usuario no es válida o está vacía.",
              );
            }

            // Consolidamos y fusionamos perfiles y aplicaciones en una única aplicación sin duplicados
            const appConsolidada = this.consolidarAplicaciones(data[0].Aplicacion);
            this.Aplicacion = appConsolidada;
            const rawMenu = appConsolidada?.Rol?.Menu || [];

            sessionStorage.setItem("aplicacion", JSON.stringify(appConsolidada));
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

  /**
   * Obtiene la aplicación activa verificando si el campo ID coincide con environment.ID.
   * En caso de serlo lo devuelve; de lo contrario, devuelve el primer elemento del arreglo.
   * Utiliza el método de búsqueda y recorrido más rápido y elegante (find con evaluación de corto circuito).
   *
   * @param aplicaciones Arreglo de aplicaciones devuelto por el perfil o sesión
   * @returns La aplicación coincidente con environment.ID o la primera del arreglo
   */
  obtenerAplicacionPorId(aplicaciones: any[]): any {
    if (!Array.isArray(aplicaciones) || aplicaciones.length === 0) return null;

    // Recorrido de alto rendimiento con corto-circuito: se detiene al primer acierto O(1)-O(n)
    return (
      aplicaciones.find(
        (app: any) => (app?.id ?? app?.ID) === environment.ID
      ) ?? aplicaciones[0]
    );
  }

  /**
   * Ordena el arreglo de aplicaciones ubicando prioritariamente en la primera posición (índice 0)
   * la aplicación cuyo campo ID coincida con environment.ID.
   * Aplica un algoritmo O(n) rápido y elegante sin la sobrecarga de un sort() tradicional.
   *
   * @param aplicaciones Arreglo de aplicaciones a ordenar
   * @returns El mismo arreglo ordenado con la aplicación activa al frente
   */
  ordenarAplicacionesPorId(aplicaciones: any[]): any[] {
    if (!Array.isArray(aplicaciones) || aplicaciones.length <= 1) {
      return aplicaciones || [];
    }

    const index = aplicaciones.findIndex(
      (app: any) => (app?.id ?? app?.ID) === environment.ID
    );

    if (index > 0) {
      const [appTarget] = aplicaciones.splice(index, 1);
      aplicaciones.unshift(appTarget);
    }

    return aplicaciones;
  }

  /**
   * Fusiona dos listas de menús de forma profunda sin duplicar módulos, submenús ni privilegios.
   * - Menús principales: se unifican por url o nombre normalizado.
   * - SubMenús: se unifican por url o nombre normalizado.
   * - Privilegios: se combinan (unión) sin duplicar método/id.
   *
   * @param menusExistentes Lista de menús ya acumulados
   * @param nuevosMenus Nuevos menús a incorporar
   * @returns Lista consolidada de menús sin duplicados
   */
  private fusionarMenus(menusExistentes: any[], nuevosMenus: any[]): any[] {
    const normalizarClave = (item: any): string => {
      if (!item) return "";
      const raw = (item.url || item.nombre || item.descripcion || "").toString().trim().toLowerCase();
      return raw.replace(/^\/+/, "");
    };

    const parsearSubMenus = (item: any): any[] => {
      let subs = item?.SubMenu ?? item?.submenu ?? item?.children ?? item?.sub_menu ?? [];
      if (typeof subs === "string" && subs.trim() !== "") {
        try {
          subs = JSON.parse(subs);
        } catch {
          subs = [];
        }
      }
      return Array.isArray(subs) ? subs : [];
    };

    const parsearPrivilegios = (sub: any): any[] => {
      const privs = sub?.Privilegios ?? sub?.Privilegio ?? [];
      return Array.isArray(privs) ? privs : [];
    };

    const menuMap = new Map<string, any>();

    // 1. Cargar menús existentes asegurando copias profundas
    (menusExistentes || []).forEach((m) => {
      const key = normalizarClave(m);
      if (key) {
        const clon = JSON.parse(JSON.stringify(m));
        clon.SubMenu = parsearSubMenus(clon);
        menuMap.set(key, clon);
      }
    });

    // 2. Procesar e incorporar nuevos menús
    (nuevosMenus || []).forEach((nuevoItem) => {
      const key = normalizarClave(nuevoItem);
      if (!key) return;

      const nuevosSubs = parsearSubMenus(nuevoItem);

      if (!menuMap.has(key)) {
        // Menú totalmente nuevo: registrar copia íntegra con sus submenús
        const nuevoClon = JSON.parse(JSON.stringify(nuevoItem));
        nuevoClon.SubMenu = nuevosSubs;
        menuMap.set(key, nuevoClon);
      } else {
        // Menú existente (ej: 'Seguridad' o 'Herramientas'): unificar sus submenús
        const itemExistente = menuMap.get(key);
        itemExistente.SubMenu = parsearSubMenus(itemExistente);

        const subMap = new Map<string, any>();
        itemExistente.SubMenu.forEach((s: any) => {
          const subKey = normalizarClave(s);
          if (subKey) subMap.set(subKey, s);
        });

        nuevosSubs.forEach((nuevoSub: any) => {
          const subKey = normalizarClave(nuevoSub);
          if (!subKey) return;

          if (!subMap.has(subKey)) {
            // SubMenú nuevo: añadirlo al menú existente
            const subClon = JSON.parse(JSON.stringify(nuevoSub));
            subClon.Privilegios = parsearPrivilegios(subClon);
            itemExistente.SubMenu.push(subClon);
            subMap.set(subKey, subClon);
          } else {
            // SubMenú compartido: consolidar privilegios (unión sin duplicados)
            const subExistente = subMap.get(subKey);
            const privMap = new Map<string, any>();

            parsearPrivilegios(subExistente).forEach((p: any) => {
              const privKey = (p?.metodo || p?.id || p?.descripcion || "").toString().trim().toLowerCase();
              if (privKey) privMap.set(privKey, p);
            });

            parsearPrivilegios(nuevoSub).forEach((p: any) => {
              const privKey = (p?.metodo || p?.id || p?.descripcion || "").toString().trim().toLowerCase();
              if (privKey && !privMap.has(privKey)) {
                privMap.set(privKey, p);
              }
            });

            subExistente.Privilegios = Array.from(privMap.values());
          }
        });
      }
    });

    return Array.from(menuMap.values());
  }

  /**
   * Agrupa y fusiona únicamente las aplicaciones que compartan el MISMO identificador (app.id).
   * Cuando existen múltiples entradas con igual ID representando diferentes perfiles:
   * - Combina sus perfiles evitando duplicados (ej: 'Administrador / Auditor').
   * - Combina las descripciones de Rol.
   * - Fusiona sus menús, submenús y privilegios sin duplicar elementos.
   * Si los app.id no coinciden entre sí, no se mezclan ("de lo contrario no hace falta").
   *
   * @param aplicaciones Lista cruda de aplicaciones
   * @returns Lista de aplicaciones donde solo las del mismo ID han sido fusionadas
   */
  mezclarAplicacionesPorId(aplicaciones: any[]): any[] {
    if (!Array.isArray(aplicaciones) || aplicaciones.length <= 1) {
      return aplicaciones || [];
    }

    // Verificar si existen IDs repetidos antes de procesar
    const idCounts = new Set<string>();
    let hayDuplicados = false;
    for (const app of aplicaciones) {
      const appId = (app?.id ?? app?.ID ?? "").toString().trim();
      if (appId && idCounts.has(appId)) {
        hayDuplicados = true;
        break;
      }
      if (appId) idCounts.add(appId);
    }

    // Si todos los app.id son diferentes, no hace falta ninguna fusión
    if (!hayDuplicados) {
      return aplicaciones;
    }

    const appMap = new Map<string, any>();

    aplicaciones.forEach((app: any) => {
      const appId = (app?.id ?? app?.ID ?? "").toString().trim();
      if (!appId) return;

      if (!appMap.has(appId)) {
        // Primera vez que vemos este ID: clonamos para trabajar de forma inmutable
        const clon = JSON.parse(JSON.stringify(app));
        clon.id = appId;
        clon.perfiles = app.perfil ? [app.perfil] : [];
        clon.roles = app.Rol?.descripcion ? [app.Rol.descripcion] : [];
        clon.Rol = clon.Rol || { descripcion: "", Menu: [] };
        clon.Rol.Menu = Array.isArray(clon.Rol.Menu) ? clon.Rol.Menu : [];
        appMap.set(appId, clon);
      } else {
        // Mismo app.id detectado: FUSIONAR menús y perfiles de esa misma aplicación
        const appExistente = appMap.get(appId);

        // 1. Unificar nombres de perfiles sin duplicados
        if (app.perfil && !appExistente.perfiles.includes(app.perfil)) {
          appExistente.perfiles.push(app.perfil);
        }

        // 2. Unificar descripciones de roles sin duplicados
        const nuevoRolDesc = app.Rol?.descripcion;
        if (nuevoRolDesc && !appExistente.roles.includes(nuevoRolDesc)) {
          appExistente.roles.push(nuevoRolDesc);
        }

        // 3. Fusionar Rol.Menu sin duplicar menús, submenús ni privilegios
        const menusNuevos = Array.isArray(app.Rol?.Menu) ? app.Rol.Menu : [];
        appExistente.Rol.Menu = this.fusionarMenus(appExistente.Rol.Menu, menusNuevos);
      }
    });

    // Reconstruir cadenas consolidadas de perfiles y roles para cada aplicación fusionada
    return Array.from(appMap.values()).map((mergedApp) => {
      mergedApp.perfil = mergedApp.perfiles.join(" / ");
      mergedApp.Rol.descripcion = mergedApp.roles.join(" | ") || "Perfil Consolidado";
      delete mergedApp.perfiles;
      delete mergedApp.roles;
      return mergedApp;
    });
  }

  /**
   * Consolidación de Perfil y Aplicación para la sesión actual
   *
   * 1. Si existen entradas con el MISMO app.id (distintos perfiles de la misma aplicación),
   *    se fusionan sus menús y roles sin duplicar información.
   * 2. Si los app.id son diferentes, no se mezclan entre sí ("de lo contrario no hace falta").
   * 3. Se selecciona y devuelve la aplicación correspondiente a environment.ID (o la primera por defecto).
   *
   * @param aplicaciones Listado de aplicaciones devueltas por el perfil
   * @returns La aplicación activa consolidada para la consola
   */
  consolidarAplicaciones(aplicaciones: any[]): any {
    if (!Array.isArray(aplicaciones) || aplicaciones.length === 0) return null;

    // Paso 1: Fusionar únicamente aquellas aplicaciones cuyo app.id coincida
    const appsProcesadas = this.mezclarAplicacionesPorId(aplicaciones);

    // Paso 2: Ordenar para situar al frente (índice 0) la aplicación coincidente con environment.ID
    this.ordenarAplicacionesPorId(appsProcesadas);

    // Paso 3: Retornar la aplicación coincidente con environment.ID (o primera disponible)
    return this.obtenerAplicacionPorId(appsProcesadas) || appsProcesadas[0];
  }
}
