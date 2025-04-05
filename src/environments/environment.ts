// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  recaptcha: {
    siteKey: '6LdcDsknAAAAAC44xkc214BZ2giOxN8JQsL7L9x2',
  },
  hmr: false,
  apiUrl: 'https://localhost',
  Url: 'https://localhost', // requerido para la Fnx_Eliminar proyectos 
  API: '/v1/api/',
  ID: 'ID-001',
  Hash: ':c521f27fb1b3311d686d511b668e5bd4',
  version: 'Development 1.0.1-ecac7af',
  fecha: '2023-03-21 22:08:00',
  driver: {
    PRINCIPAL : 'MGDBA',
    DATA_BASE : "code-epic",
    API_CORE_NAME: "apicore",
    API_CORE_ZIP: "apicore.zip"
  },
  colecciones: {
    WUSUARIO : 'wusuario',
    USER_TASK : 'user-task'
  },
  functions: {
    MILITAR: 'EJB_CMilitar',
    ACTUALIAZAR_MENU : "_SYS_ActualizarMenu",
    OBTENER_NOMBRE_ARCHIVO: "_SYS_getFileName",
    INSERT_FILE_PATH : "_SYS_ISetPath",
    LISTAR_COMUNICACIONES : '_SYS_LstComunicaciones'
  },
  subPath: {
    LOGIN: 'ipsfa/api/web/loginWsx',
    RECOVERY: 'wusuario/login'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
