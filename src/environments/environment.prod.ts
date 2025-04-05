export const environment = {
  production: true,
  recaptcha: {
    siteKey: '6LdcDsknAAAAAC44xkc214BZ2giOxN8JQsL7L9x2',
  },
  hmr: false,
  apiUrl: 'https://localhost',
  Url: 'https://localhost',
  API: '/v1/api/',
  ID: 'ID-001',
  Hash: ':c521f27fb1b3311d686d511b668e5bd4',
  version: 'Enterprise 1.0.1-ecac7af',
  fecha: '2023-03-21 22:08:00',
  BD : 'code-epic',
  driver: {
    PRINCIPAL : 'MGDBA',
    DATA_BASE : "code-epic",
    API_CORE_ZIP: "apicore.zip",
    SYS_FUNCION_ZIP: "sys-function.zip"
  },
  colecciones: {
    WUSUARIO : 'wusuario',
    USER_TASK : 'user-task',
    API_CORE_NAME: "apicore",
    SYS_FNX_NAME: "sys-function"
  },
  functions: {
    MILITAR: 'EJB_CMilitar',
    ACTUALIAZAR_MENU : "_SYS_ActualizarMenu",
    OBTENER_NOMBRE_ARCHIVO: "_SYS_getFileName",
    INSERT_FILE_PATH : "_SYS_ISetPath",
    LISTAR_COMUNICACIONES : '_SYS_LstComunicaciones',
    LISTAR_FUNCIONES : '_SYS_LFunciones',
    EXPORTAR_API : 'Fnx_ExportarAPI',
    EXPORTAR_FUNCIONES : 'Fnx_ExportarFunciones',
    LISTAR_APLICACIONES: '_SYS_LstAplicaciones',
    RESTAURAR_API: 'Fnx_RestaurarAPI',
    RESTAURAR_FUNCIONES: 'Fnx_RestaurarFunciones'
  },
  subPath: {
    LOGIN: 'ipsfa/api/web/loginWsx',
    RECOVERY: 'wusuario/login'
  }
};
