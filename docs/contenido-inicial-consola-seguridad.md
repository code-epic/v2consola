# Contenido inicial — Sandra UI Consola

**Audiencia:** Seguridad institucional
**Objetivo:** presentar el concepto inicial de la plataforma Sandra y los cuatro primeros menús de la consola: **Conexiones, Herramientas, Seguridad y Bóveda**.
**Responsable:** Valhala (productos Angular del ecosistema Sandra).
**Fecha:** 2026-11-20
**Alcance:** investigación y generación de contenido. **No se modificó código de producción.**

> **Nota de versión (importante para el equipo de seguridad):** el contexto global menciona «Angular 14», pero la evidencia real en disco es **Angular 22.0.0** (`package.json`, líneas 42–52 y 125–130) con TypeScript ~6.0 y builder `@angular/build:application` (`angular.json`, línea 18). El resto del ecosistema (por ejemplo SSSIFANB) sí usa Angular 17. Esta diferencia ya había sido registrada en `TASK-OWASP-v2consola.md` (línea 12); conviene corregir la nomenclatura del backlog antes de la presentación institucional.

---

## 1. Evidencia encontrada en el código

| Archivo (ruta relativa al proyecto) | Hallazgo concreto |
|---|---|
| `package.json` | `"name": "consola"`, `"version": "3.0.0"`, `"description": "Sandra Server - Consola"`. Scripts: `start` (`ng serve --open --port 4200 --proxy-config ./src/proxy.conf.json`), `build:prod` (`node build.js && ng build --configuration production --base-href="./" && ./strip-maps.sh`). Dependencias Angular `^22.0.0`, RxJS 7, SCSS, Bootstrap 4.6, ngx-datatable, ng-bootstrap, xterm, jwt-decode, crypto-js, sweetalert2. |
| `angular.json` | Proyecto interno llamado `vuexy` (herencia de plantilla), `sourceRoot: src`, `outputPath: dist`, `baseHref: "./"`, `sourceMap: false` y `aot: true` en producción. `serve` usa `src/proxy.conf.json`. |
| `src/proxy.conf.json` | En desarrollo, `/v1/api` y `/devel/api` se redirigen a `https://localhost` con `secure: false` y `logLevel: debug`. Punto a revisar por Seguridad (certificados y ruido de logs). |
| `README.md` | Define la consola como frontend del servidor; acceso posterior a la instalación en `https://localhost/panel`. Documenta navegación histórica: Login, Principal, Redes Informáticas, Herramientas, Aplicaciones, Seguridad, Opciones; también describe bitácora, orquestación Fnx, telemetría WSS, IA y normativas ISO 27001/22301/25010. |
| `src/app/app.module.ts` | Rutas raíz: `''` → `PagesModule`, `communication/forums` → `CommunicationModule`, `**` → `/miscellaneous/error`. Router con `useHash: true`. Módulos importados de forma **eager**: `NetworksModule`, `ToolsModule`, `SecurityModule`, `BovedaModule`, `ApplicationsModule`, `InvestigationModule`, `OptionsModule`, `SoporteModule`, `GithubModule`. Registra `AuthInterceptorService` vía `HTTP_INTERCEPTORS` y `zoneInterceptor` vía `provideHttpClient(withInterceptors([zoneInterceptor]))`. Configura reCAPTCHA V3 y `PushService`. |
| `src/app/menu/menu.ts` | Menú estático de respaldo: **solo `Principal`** (`id: 'principal'`, `icon: 'home'`, `url: ''`). Es el fallback cuando no hay sesión o no hay menú en `sessionStorage`. |
| `src/app/menu/schema.ts` | Esquema maestro de menús del perfil `App.Consola` / `Core Sandra Server`: `Principal`, `Redes → Comunicaciones, Conexiones`, `Herramientas → Funciones, Api, WorkFlow`, `Aplicaciones → Listar, Registrar, Definir Menu, Mensajería, Conciliación`, `Seguridad → Reglas Generales, Roles, Perfil, Usuarios, Lista Usuarios`, `Investigación → Bitácora, Logs`, `Opciones`, `Comunicación → Foros`, `Incidencias → Registro`. **No incluye Bóveda** en este esquema maestro. |
| `src/app/app.component.ts` | Al arrancar, si existe `token`, lee `sessionStorage.menu`, lo convierte con `loginService.buildMenu(...)` y lo registra en `CoreMenuService` con clave `"main"`; si no hay menú, invoca `obenterAplicacion(token)`. Si no hay token, usa el menú estático de `menu.ts`. |

| `src/@services/seguridad/login.service.ts` | `obenterAplicacion()` consulta la función backend `_SYS_CUsuarioPerfil` (`environment.functions.CONSULTAR_USUARIO_PERFIL`), consolida aplicaciones/perfiles, guarda `aplicacion`, `menu` y `crypt` (MD5 del menú) en `sessionStorage`, construye el menú con `buildMenu()` y lo inyecta en caliente en `CoreMenuService`. `fusionarMenus()` unifica menús, submenús y privilegios de perfiles repetidos. |
| `src/@core/components/core-menu/core-menu.service.ts` | Registro reactivo de menús (`register`, `setCurrentMenu`, `onMenuChanged`). Es el mecanismo que permite cambiar la navegación sin recargar la página. |
| `src/app/main/views/networks/networks.module.ts` | Rutas protegidas por `AuthGuardGuard`: `networks/communications` y `networks/connections`. |
| `src/app/main/views/tools/tools.module.ts` | Rutas protegidas: `tools/functions`, `tools/applications`, `tools/applications/:id`, `tools/applications/api-list/:id`, `tools/applications/api-details/:id/:ruta`, `tools/applications/register-api/:id/:ruta`, `tools/applications/update-api/:id/:ruta`, `tools/workflow`. |
| `src/app/main/views/security/security.module.ts` | Rutas protegidas: `security/rules`, `security/role`, `security/profile`, `security/user`, `security/user/:id` (con `canDeactivate`) y `security/user-list`. |
| `src/app/main/views/boveda/boveda.module.ts` | Rutas protegidas: `boveda/authorization`, `boveda/reportes`, `boveda/crontab`. El módulo existe y está importado en `AppModule`, aunque no aparece en `schema.ts`. |
| `src/@services/seguridad/schema_admin.json` | Perfil administrativo que **sí** contiene el menú `Boveda → Autorizaciones, Reportes, Crontab` (líneas 410–455). Es la evidencia de que Bóveda se entrega por perfil/backend, no por el esquema base. |
| `src/app/main/home/home.component.ts` | Tarjetas del concepto inicial de plataforma: `Sandra Core L7` (Seguridad de Aplicación, reto PoW y cabeceras), `APICore Engine` (microkernel de servicios), `Telemetría WSS` (streaming bidireccional TLS 1.3) y `Bóveda & Trazabilidad` (custodia de certificados, registro inmutable, prevención de fuga de datos). Lee nombre/correo/sistema del JWT decodificado desde `sessionStorage.token`. |
| `src/environments/environment.ts` | `apiUrl: https://localhost`, `WSS: wss://localhost`, `API: /v1/api/`, `ID: sandra.app.consola`, `Hash` embebido, `colecciones.sys-conections`, `functions.*` con nombres como `_SYS_CUsuarioPerfil`, `Fnx_ScanRed` (usado por componentes), `_SYS_CBoveda`, `_SYS_UBoveda`, `_SYS_UUserTOTP`, `Fnx_BackupLogs`, entre otros. |
| `src/@services/apicore/api.service.ts` | `Ejecutar()` publica a `/v1/api/crud:{hash}`; `ExecFnx()` a `/v1/api/fnx`; `Guardar()` a `/v1/api/{sApi}:{hash}`. Todas con `Authorization: Bearer <token>`. |
| `src/@services/seguridad/auth-guard.guard.ts` | Valida presencia y decodificación del JWT, comprueba `environment.ID`, compara MD5 del menú contra `sessionStorage.crypt` y autoriza la ruta recorriendo `menu`/`SubMenu`. Tiene whitelist: `home`, `principal`, `options/upgrade`. |
| `src/@services/seguridad/auth-interceptor.service.ts` | Para peticiones con cuerpo y no GET: agrega `Authorization: Bearer`, `Web-API-key`, `X-Signature` (HMAC-SHA256 del body + timestamp con `environment.Hash`) y `X-Timestamp`. Maneja 401/403/504 cerrando sesión o mostrando alerta. |
| `src/@services/seguridad/zone-interceptor.ts` | Reinygresa las respuestas HTTP a `NgZone` (compatibilidad con FetchBackend de Angular 22). |
| `src/@services/websockets/wsockets.service.ts` | `instanciar()` apunta a `wss://localhost:3000/ws?id=panel` (valor fijo a revisar para producción institucional). |
| `TASK-OWASP-v2consola.md` | Auditoría previa (2026-10-12) con hallazgos críticos: secreto HMAC en el bundle, RBAC dependiente de `sessionStorage` + MD5, XSS por HTML confiable y dependencias vulnerables. Se usa como insumo del plan de validación; **no se modificó aquí**. |

**Conclusión de la exploración:** de los cuatro ejes solicitados, **Herramientas** y **Seguridad** ya son menús de primer nivel en el esquema maestro; **Conexiones** existe hoy como submenú de `Redes`; **Bóveda** existe como módulo/rutas y en el perfil administrativo, pero no en el menú base. La propuesta siguiente solo reordena y nombra lo que el código ya permite, sin inventar funcionalidad nueva.

---

## 2. Concepto: la consola como cara visible de Sandra Server

Sandra es una plataforma distribuida: el backend combina un núcleo en **Go** (Sandra Server / Valquiria: API REST, WebSockets, gRPC, reglas y orquestación) y un motor en **Rust** (Sentinel: cálculo y ejecución de fórmulas), con persistencia MongoDB/relacional y canales seguros TLS/WSS. **Sandra UI Consola no es un producto final independiente**: es el panel operativo que se sirve junto al servidor y traduce esa maquinaria en pantallas para el operador institucional.

En la presentación se puede usar esta frase rectora:

> «Sandra Server es el motor; la consola es el tablero. Donde el backend ejecuta, valida y registran, la consola observa, decide y autoriza.»

Para Seguridad institucional, el mensaje clave es que la consola concentra en un solo lugar cuatro responsabilidades:

1. **Ver el estado de las conexiones** hacia bases de datos y servicios.
2. **Operar herramientas** de funciones, APIs y flujos de trabajo.
3. **Gobernar identidad y acceso**: reglas, roles, perfiles y usuarios.
4. **Custodiar y auditar**: autorizaciones, reportes y tareas programadas de la bóveda.

La tarjeta `Bóveda & Trazabilidad` del `home.component.ts` resume este espíritu: custodia de certificados, registro inmutable y prevención de fuga de datos.

---

## 3. Contenido técnico de los cuatro primeros menús

### Propuesta de estructura inicial (sin código nuevo)

| # | Menú propuesto | Submenús a mostrar | Origen real en el código |
|---|---|---|---|
| 1 | **Conexiones** | Comunicaciones, Conexiones | `schema.ts` los tiene bajo `Redes`; `networks.module.ts` expone las rutas. Se propone elevar el nombre `Conexiones` a primer nivel para alinearlo con el eje de la presentación. |
| 2 | **Herramientas** | Funciones, APIs, WorkFlow | Ya es primer nivel en `schema.ts` (líneas 76–142) y en `tools.module.ts`. |
| 3 | **Seguridad** | Reglas Generales, Roles, Perfiles, Usuarios, Lista de Usuarios | Ya es primer nivel en `schema.ts` (líneas 246–348) y en `security.module.ts`. |
| 4 | **Bóveda** | Autorizaciones, Reportes, Crontab | Rutas y módulo existentes (`boveda.module.ts`); menú presente en `schema_admin.json` pero ausente en `schema.ts`. Requiere inclusión en el menú dinámico del perfil institucional. |

Módulos transversales que conviene mencionar en la lámina de cierre, sin elevarlos a los cuatro primeros: **Aplicaciones** (registro y menú de apps), **Investigación/Bitácora** (trazabilidad y logs), **Opciones** (actualización), **Comunicación/Foros** e **Incidencias**.

---

### 3.1 Conexiones

**Estado actual:** dentro de `Redes` (`src/app/menu/schema.ts`, líneas 27–75). El componente `ConnectionsComponent` está en `src/app/main/views/networks/connections/connections.component.ts`.

**Qué ve el operador:**

- Un encabezado «Conexiones» con ruta de migas *Principal → Redes → Conexiones*.
- Tarjetas KPI con totales: conexiones, activas e inactivas (`totalConexiones`, `totalActivos`, `totalInactivos`).
- Píldoras de filtro por estatus (`Todos / Activos / Inactivos`), selector de **driver** y buscador textual.
- Una tabla (`ngx-datatable`) con `driver`, `basedatos`, `descripcion`, `host`, `usuario`, `puerto`, `protocolo` y `estatus`. Las filas activas llevan borde verde; las inactivas tono vino (`getRowClass`).
- Un formulario de alta/edición con validaciones: `id`, `usuario`, `basedatos`, `clave`, `host`, `puerto`, `driver`, `protocolo`, `estatus`, `aplicacion` y `descripcion`. La clave se puede mostrar/ocultar (`togglePasswordTextType`).
- Un diagnóstico de red: el botón de escaneo invoca `Fnx_ScanRed` con `host` y `puerto`; el resultado se refleja en un área de texto y se apoya en el PID devuelto por el backend (`ConsultarPidScan`).

**Datos que muestra / acciones que habilita:**

| Dato o acción | Origen o destino |
|---|---|
| Listado de conexiones | `ApiService.Ejecutar()` con `LISTAR_DRIVERS` (`environment.functions.LISTAR_DRIVERS`). |
| Catálogo de drivers y hosts | `ComunicationsService.ListarDrivers()` y `ComunicationsService.Listar()`. |
| Evaluar / establecer conexión | `ConexionesService.EvaluarConexion()` y `EstablecerConexion()` (`src/@services/networks/connections.service.ts`). |
| Escaneo de socket TCP | `ApiService.ExecFnx({ funcion: 'Fnx_ScanRed', host, puerto })`. |
| Hermano funcional: Comunicaciones | Ruta `networks/communications`, protegida por `AuthGuardGuard`. |

**Valor para Seguridad:** es la vista de superficie de conexión: qué motores de datos están vivos, hacia qué hosts, con qué cuentas y protocolos. Es el punto natural para exigir revisión de credenciales, puertos expuestos y cifrado de tránsito.

---

### 3.2 Herramientas

**Estado actual:** menú de primer nivel en `schema.ts` (líneas 76–142); módulo `tools.module.ts` con ocho rutas protegidas.

**Qué ve el operador:**

- **Funciones** (`tools/functions`): cabecera «Gestión de Funciones». Lista de funciones del servidor, aplicaciones asociadas, exportación y restauración de paquetes (`EXPORTAR_FUNCIONES`, `RESTAURAR_FUNCIONES`, `INSERT_FILE_PATH`, `OBTENER_NOMBRE_ARCHIVO`).
- **API** (`tools/applications` → `tools/applications/:id` → detalle/registro): cabeceras «Herramientas», «Directorio de APIs» y «Detalle API REST». Permite explorar APIs por aplicación/driver, ver metadatos (`_SYS_R_ListarApisID`, `_SYS_R_ListarApisAPP`) y registrar o actualizar definiciones (`_SYS_MYSQL`, `_SYS_POSTGRES` según el caso, validación de existencia vía `CONSULTAR_EXISTENCIA_APICORE`).
- **WorkFlow** (`tools/workflow`): definición de flujos, estados, transiciones y redes (`WKF_IDefinicion`, `WKF_IEstados`, `WKF_ITransicion`, `WKF_IRed`, `WKF_CEstatus`).

**Datos que muestra / acciones que habilita:** catálogos de funciones, APIs y aplicaciones (`_SYS_LFunciones`, `_SYS_LstAplicaciones`, `_SYS_CDrivers`), definiciones de flujo y estados. Habilita exportar/importar definiciones, registrar APIs y modelar transiciones.

**Valor para Seguridad:** aquí se decide **qué puede ejecutar el servidor y cómo**. Cada cambio en una función o API cambia la superficie de ataque; por eso la lámina debe marcar estas acciones como sensibles y sujetas a doble control y bitácora.

---

### 3.3 Seguridad

**Estado actual:** menú de primer nivel en `schema.ts` (líneas 246–348); módulo `security.module.ts` con seis rutas protegidas.

**Qué ve el operador:**

- **Reglas Generales** (`security/rules`): cabecera «Reglas de Seguridad». Consulta la configuración por aplicación (`_SYS_CReglasApp`) y permite ajustar, entre otros, la duración de tokens (`ACTUALIZAR_TOKENS`).
- **Roles** (`security/role`): cabecera «Seguridad». Lista aplicaciones, módulos y menús (`LISTAR_MODULOS`, `LISTAR_MENUS`, `OMenuAccion`), crea definiciones y detalles de rol (`_SYS_IRolDefinicion`, `_SYS_IRolDetalles`) y edita roles (`_SYS_CRolEditar`).
- **Perfil** (`security/profile`): asigna menús y acciones a perfiles (`INSERTAR_PERFIL`, `INSERTAR_PERFIL_DETALLE`, `ELIMINAR_PERFIL`, `UPDATE_ALL_USER_PROFILE`), consulta perfiles activos y acciones de menú (`LISTAR_MENU_ACCIONES`).
- **Usuarios** (`security/user`, `security/user/:id`): alta y edición de usuario, asignación de aplicaciones/perfiles, consulta de cédula/login, endpoint de oficinas y regionales, y configuración TOTP (`ACTUALIZAR_TOTP`, `ACTUALIZAR_CLAVE`). Tiene `canDeactivate` para evitar pérdida de cambios.
- **Lista de Usuarios** (`security/user-list`): cabecera «Lista de Usuarios»; consulta usuarios y bloqueos (`LISTAR_USUARIOS`, `LISTAR_USUARIOS_BLOQUEADOS`, `ELIMINAR_BLOQUEO_USUARIO`, `ELIMINAR_USUARIO`, `ACTUALIZAR_CLAVE`). Genera una «Caución de Seguridad» imprimible en PDF.

**Datos que muestra / acciones que habilita:** identidades, roles, perfiles, privilegios por menú/acción, reglas de token y estado de bloqueo. Habilita otorgar o revocar acceso, definir perfiles, desbloquear cuentas y regenerar credenciales.

**Valor para Seguridad:** es el módulo de gobernanza de identidad. En la presentación debe quedar claro que el menú que ve el operador es **resultado** de esta configuración, y que la autoridad real debe residir en el backend (ver sección 5).

---

### 3.4 Bóveda

**Estado actual:** módulo implementado y rutas activas (`boveda.module.ts`), tarjeta ideas en `home.component.ts`, menú en `schema_admin.json`. **Pendiente:** incluirlo en el menú maestro/dinámico del perfil institucional para que aparezca como cuarto menú de primer nivel.

**Qué ve el operador:**

- **Autorizaciones** (`boveda/authorization`): cabecera «Autorizaciones» con migas *Inicio → Boveda → Autorizaciones*. Tabla de solicitudes con `authid`, `name`, `user`, `aplication`, `funcion`, `tiempo` y tiempo transcurrido calculado en vivo (`elapsedTime`); resalta en ámbar solicitudes con 10 o más minutos (`isWarning`). Filtros por texto y aplicación. La acción **Aprobar** confirma con SweetAlert, ejecuta `_SYS_UBoveda` con `authid,1` y, si la solicitud trae `ws_user_id`, envía una notificación WebSocket al nodo origen (`type: 'hsf'`, `status: 'approved'`).
- **Reportes** (`boveda/reportes`): cabecera «Reportes»; «Consolidado de actividades y registros históricos de la bóveda».
- **Crontab** (`boveda/crontab`): cabecera «Crontab»; programación y automatización de tareas de la bóveda.

**Datos que muestra / acciones que habilita:** listado de autorizaciones pendientes vía `LISTAR_AUTHORIZATIONS` (`_SYS_CBoveda`), aprobación con traza y notificación, consulta de reportes históricos y administración de tareas programadas.

**Valor para Seguridad:** materializa el principio de **doble control**: una operación sensible no se ejecuta hasta que un autorizador la aprueba desde esta pantalla. Es el lugar donde se demuestra irrefutabilidad (quién aprobó, cuándo y desde qué nodo) y se conecta con la bitácora de `Investigación`.

---

## 4. Ficha técnica resumida

| Campo | Valor |
|---|---|
| Proyecto | `angular/code-epic.io/v2consola` — paquete `consola`, versión `3.0.0`, descripción «Sandra Server - Consola». Proyecto Angular interno `vuexy`. |
| Rol en el ecosistema | Frontend/panel de **Sandra Server**; no es un producto independiente. Se publica bajo el mismo host del servidor (README: `https://localhost/panel`). |
| Stack real | **Angular 22.0.0**, TypeScript ~6.0, RxJS 7, Angular CLI/`@angular/build:application`, SCSS, Bootstrap 4.6, ng-bootstrap, ngx-datatable, ngx-translate, SweetAlert2, xterm, jwt-decode, crypto-js. |
| Puerto de desarrollo | **4200** (`npm run start`, con `--open` y proxy `src/proxy.conf.json`). |
| Proxy de desarrollo | `/v1/api` → `https://localhost`; `/devel/api` → `https://localhost`; `secure: false`, `logLevel: debug`. En producción el backend sirve el panel y las APIs. |
| Build | `npm run build:prod` = `node build.js` + `ng build --configuration production --base-href="./"` + `./strip-maps.sh`. Salida `dist/`, `sourceMap: false`, `aot: true`. |
| Router | `RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled', useHash: true })`. Rutas hijas por módulo (`networks/*`, `tools/*`, `security/*`, `boveda/*`, `investigation/*`). |
| Navegación | Menú estático de respaldo en `src/app/menu/menu.ts` (solo Principal); menú real construido desde el perfil backend por `LoginService.buildMenu()` y registrado en `CoreMenuService` con clave `main`. Esquemas de referencia en `src/app/menu/schema.ts` y `src/@services/seguridad/schema_*.json`. |
| Autenticación visible en frontend | JWT guardado en `sessionStorage.token`; `AuthGuardGuard` valida token, `environment.ID = sandra.app.consola` y rutas del menú; `AuthInterceptorService` agrega `Bearer`, `Web-API-key`, `X-Signature` HMAC-SHA256 y `X-Timestamp` (body + timestamp) en peticiones con cuerpo. reCAPTCHA V3 configurado. |
| Autorización visible en frontend | Menú y privilegios provienen del backend (`_SYS_CUsuarioPerfil`), se consolidan por perfil y se guardan en `sessionStorage.menu`; `crypt` guarda MD5 de ese menú. `AuthGuardGuard` compara ambos y recorre `SubMenu` para permitir la ruta; whitelist: `home`, `principal`, `options/upgrade`. |
| Integración con backend | `ApiService.Ejecutar()` → `/v1/api/crud:{hash}`; `ExecFnx()` → `/v1/api/fnx`; `Guardar()` → `/v1/api/{sApi}:{hash}`; subida de archivos → `/v1/api/subirarchivos`. WebSocket en `wss://localhost:3000/ws?id=panel` (valor actual en `WsocketsService`). Funciones backend declaradas en `environment.functions` (perfiles, menús, roles, usuarios, logs, bóveda, APIs, respaldos). |
| Proveedores globales | `AuthInterceptorService`, `zoneInterceptor`, `PushService`, `provideCharts`, `RECAPTCHA_V3_SITE_KEY`. |
| Estado de seguridad | Existe auditoría previa `TASK-OWASP-v2consola.md` con hallazgos críticos; debe ser insumo obligatorio del plan de integración. No se asume resuelto. |

---

## 5. Plan de trabajo para la integración institucional (perspectiva consola)

### 5.1 Hitos

| Hito | Entregable de la consola | Dependencia de Valquiria / backend | Validación con Seguridad |
|---|---|---|---|
| **H0 — Alinear inventario y versión** | Matriz «menú documentado vs. ruta real vs. esquema de perfil». Corregir en backlog Angular 14 → Angular 22. Confirmar que `Bóveda` se mostrará como cuarto menú. | Confirmar qué menús envía `_SYS_CUsuarioPerfil` para el ID `sandra.app.consola` y para los perfiles institucionales. | Revisar la matriz y aprobar el nombre visible de los cuatro menús. |
| **H1 — Gobernanza de identidad** | Ajustar etiquetas y ayudas de `Seguridad` para que el operador entienda roles, perfiles, privilegios por menú/acción y TOTP. | **Crítico:** el backend debe validar permisos en cada endpoint y devolver 403; la consola solo oculta/ordena opciones. Retirar dependencia de `crypt`/MD5 como autoridad. | Prueba negativa: modificar `sessionStorage.menu`/`crypt` y confirmar que el servidor sigue bloqueando. Revisar whitelist y `whitelistedUrls`. |
| **H2 — Conexiones y superficie de red** | Dejar `Conexiones` como primer menú; pulir KPIs, filtros y diagnóstico `Fnx_ScanRed`. | Endpoints de drivers/hosts, `EvaluarConexion`, `EstablecerConexion` y PIDs de escaneo. | Verificar qué credenciales se muestran, enmascaramiento de claves, puertos expuestos, protocolos y registro de cada escaneo. |
| **H3 — Herramientas bajo doble control** | Marcar visualmente operaciones sensibles (exportar/importar funciones y APIs, cambios de WorkFlow). | Auditoría server-side de cada ejecución de función/API; control de versión de definiciones. | Aprobar política de dos personas para exportación/restauración y revisar trazabilidad en `Investigación`. |
| **H4 — Bóveda operativa** | Incluir `Boveda` en el menú del perfil institucional; verificar autorizaciones, reportes y crontab. | Semilla RBAC de `boveda/*` y funcionamiento de `_SYS_CBoveda` / `_SYS_UBoveda` y notificación WSS. | Simular autorización, aprobación y notificación; comprobar que queda registro con usuario, hora y nodo. |
| **H5 — Hardening y entrega** | Aplicar ajustes de configuración de la consola: TLS estricto en proxy, CSP, manejo de secretos, saneamiento de HTML, actualización de dependencias y revisión del WebSocket fijo. | Certificados, WAF/headers y rotación de claves en el servidor. | Ejecutar `TASK-OWASP-v2consola.md`: SAST, SCA (`npm audit`), DAST y pruebas de regresión de los cuatro menús. |

### 5.2 Dependencias críticas con el backend

1. **Menú autoritativo:** hoy el frontend persiste `menu` en `sessionStorage`. Para institucionalizarlo, Valquiria debe entregar el menú filtrado por perfil y volver a validar permisos en cada petición. El guard de la consola debe ser una ayuda de UX, no la última línea de defensa.
2. **Secreto de firma:** `environment.Hash` viaja en el bundle y se usa como `Web-API-key` y clave HMAC. Debe moverse a un esquema donde el navegador no posea la clave (backend/proxy o derivación segura), con rotación documentada.
3. **WebSocket:** `wss://localhost:3000/ws?id=panel` está fijo en `WsocketsService`; debe parametrizarse por entorno y pasar por TLS con autenticación equivalente a la sesión.
4. **Funciones y PIDs:** los flujos largos (escaneo, exportación, respaldo) dependen de `ExecFnx` y del sondeo de PID. Seguridad debe exigir que el PID esté ligado al usuario autenticado y a su autorización.
5. **Bitácora:** cada acción sensible de los cuatro menús debe caer en `Investigación/Bitácora` con identificador de transacción, usuario, timestamp y resultado.

### 5.3 Consideraciones de RBAC/seguridad visibles en la IU

- **Principio de menor privilegio en la pantalla:** si el perfil no tiene un submenú, la consola no debe dibujarlo; pero el servidor debe negar la ruta API aunque se invoque directamente.
- **Separación de roles sugerida para la presentación:**
  - *Operador de Conexiones*: ver y diagnosticar conexiones; no crear credenciales.
  - *Operador de Herramientas*: ejecutar funciones permitidas; no exportar definiciones críticas sin aprobación.
  - *Administrador de Seguridad*: gestionar roles, perfiles y usuarios; no aprobar bóveda salvo que su perfil lo incluya.
  - *Autorizador de Bóveda*: aprobar solicitudes y consultar reportes; sin permisos de administración de usuarios.
  - *Auditor*: solo `Investigación/Bitácora` y reportes, sin acciones de escritura.
- **Datos sensibles en pantalla:** en `Conexiones` hay usuario/base de datos/puerto y campo de clave; en `Seguridad` hay TOTP y caución PDF; en `Bóveda` hay nombres de solicitante y nodo. Definir enmascaramiento, retención y exportación permitida.
- **Mensajería WebSocket:** la aprobación de bóveda envía `authid`, node y estado; validar que no exponga datos de la solicitud más allá del destinatario autorizado.

### 5.4 Validaciones a realizar con el equipo de seguridad

- [ ] Confirmar el inventario de menús por perfil (incluida la inclusión de `Boveda` en el menú base/institucional).
- [ ] Probar acceso directo a `networks/*`, `tools/*`, `security/*` y `boveda/*` con y sin token, y con token manipulado.
- [ ] Verificar que una modificación de `sessionStorage.menu`/`crypt` no concede acceso a rutas ni a APIs.
- [ ] Revisar el manejo de 401/403/504 del interceptor y el cierre de sesión.
- [ ] Verificar cabeceras de seguridad, CSP y certificados TLS del host que sirve `/panel` y `/v1/api`.
- [ ] Comprobar que no se loguean tokens, claves de conexión ni secretos TOTP en consola del navegador.
- [ ] Ejecutar auditoría de dependencias y aplicar lo viable del plan `TASK-OWASP-v2consola.md`.
- [ ] Validar que escaneos, exportaciones, respaldos y aprobaciones quedan en bitácora con usuario y hora.
- [ ] Verificar el flujo completo de Bóveda: solicitud → aviso → aprobación → notificación WSS → reporte.
- [ ] Aceptar la ficha técnica y el mapa de rutas de este documento como línea base de la presentación.

---

## 6. Mapa rápido de rutas (para la lámina)

| Menú | Submenú | Ruta Angular | Módulo |
|---|---|---|---|
| Principal | Inicio | `home`, `Principal` | `HomeModule` |
| Conexiones | Comunicaciones | `networks/communications` | `NetworksModule` |
| Conexiones | Conexiones | `networks/connections` | `NetworksModule` |
| Herramientas | Funciones | `tools/functions` | `ToolsModule` |
| Herramientas | APIs | `tools/applications`, `tools/applications/:id`, `api-list/:id`, `api-details/:id/:ruta`, `register-api/:id/:ruta` | `ToolsModule` |
| Herramientas | WorkFlow | `tools/workflow` | `ToolsModule` |
| Seguridad | Reglas Generales | `security/rules` | `SecurityModule` |
| Seguridad | Roles | `security/role` | `SecurityModule` |
| Seguridad | Perfil | `security/profile` | `SecurityModule` |
| Seguridad | Usuarios | `security/user`, `security/user/:id` | `SecurityModule` |
| Seguridad | Lista Usuarios | `security/user-list` | `SecurityModule` |
| Bóveda | Autorizaciones | `boveda/authorization` | `BovedaModule` |
| Bóveda | Reportes | `boveda/reportes` | `BovedaModule` |
| Bóveda | Crontab | `boveda/crontab` | `BovedaModule` |
| Investigación | Bitácora / Logs | `investigation/binnacle`, `investigation/logs` (+ traza, eventos, sensores) | `InvestigationModule` |

---

## 7. Cierre sugerido para la presentación

> «La consola no promete seguridad por ocultar botones: la promete al hacer visible cada conexión, cada herramienta, cada decisión de acceso y cada autorización, con el servidor como autoridad final y la bitácora como memoria institucional.»

**Entregable generado:** `angular/code-epic.io/v2consola/docs/contenido-inicial-consola-seguridad.md`.
