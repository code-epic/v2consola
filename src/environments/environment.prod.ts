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
