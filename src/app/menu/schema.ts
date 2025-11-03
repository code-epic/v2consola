


export const aplicacion = [
  {
    "id": "App.Consola",
    "nombre": "Core Sandra Server",
    "url": "http://localhost/consola",
    "comentario": "Usuario Core",
    "version": "2.0.0",
    "autor": "Code-Epic Technologies",
    "Rol": {
      "descripcion": "Usuario Sistema",
      "Menu": [
        {
          "url": "/principal",
          "js": "",
          "icono": "home",
          "descripcion": "home",
          "nombre": "Principal",
          "accion": "",
          "clase": "item",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/redes",
          "js": "",
          "icono": "server",
          "descripcion": "Redes",
          "nombre": "Redes",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "networks/communications",
              "js": "",
              "descripcion": "Comunicaciones",
              "icono": "hard-drive",
              "nombre": "Comunicaciones",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "networks/connections",
              "js": "",
              "descripcion": "Conexiones",
              "icono": "link",
              "nombre": "Conexiones",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            }
          ]
        },
        {
          "url": "/herramientas",
          "js": "",
          "icono": "tool",
          "descripcion": "Herramientas",
          "nombre": "Herramientas",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "tools/functions",
              "js": "",
              "descripcion": "Funciones",
              "icono": "align-justify",
              "nombre": "Funciones",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "tools/applications",
              "js": "",
              "descripcion": "Api",
              "icono": "edit",
              "nombre": "Api",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "tools/workflow",
              "js": "",
              "descripcion": "WorkFlow",
              "icono": "command",
              "nombre": "WorkFlow",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            }
          ]
        },
        {
          "url": "/aplicaciones",
          "js": "",
          "icono": "layers",
          "descripcion": "Aplicaciones",
          "nombre": "Aplicaciones",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "applications/list",
              "js": "",
              "descripcion": "Listar",
              "icono": "circle",
              "nombre": "Listar",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "applications/install",
              "js": "",
              "descripcion": "Registrar",
              "icono": "circle",
              "nombre": "Registrar",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "applications/menu",
              "js": "",
              "descripcion": "Definir Menu",
              "icono": "circle",
              "nombre": "Definir Menu",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "applications/sms",
              "js": "",
              "descripcion": "Mensajeria",
              "icono": "circle",
              "nombre": "Mensajeria",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "applications/conciliation",
              "js": "",
              "descripcion": "Conciliación",
              "icono": "circle",
              "nombre": "Conciliación",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            }
          ]
        },
        {
          "url": "security",
          "js": "",
          "icono": "lock",
          "descripcion": "Seguridad",
          "nombre": "Seguridad",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "security/rules",
              "js": "",
              "descripcion": "Reglas Generales",
              "icono": "circle",
              "nombre": "Reglas Generales",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "security/role",
              "js": "",
              "descripcion": "Roles",
              "icono": "circle",
              "nombre": "Roles",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "security/profile",
              "js": "",
              "descripcion": "Perfil",
              "icono": "circle",
              "nombre": "Perfil",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "security/user",
              "js": "",
              "descripcion": "Usuarios",
              "icono": "circle",
              "nombre": "Usuarios",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "security/user-list",
              "js": "",
              "descripcion": "Lista Usuarios",
              "icono": "circle",
              "nombre": "Lista Usuarios",
              "accion": "CargarUrl('control', 'buzon')",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "recibidos",
                  "descripcion": "Recibidos",
                  "accion": "Recibidos()",
                  "directivas": ""
                }
              ]
            }
          ]
        },
        {
          "url": "investigation",
          "js": "",
          "icono": "search",
          "descripcion": "Investigación",
          "nombre": "Investigación",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "investigation/binnacle",
              "js": "",
              "descripcion": "Bitacora",
              "icono": "circle",
              "nombre": "Bitacora",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "investigation/logs",
              "js": "",
              "descripcion": "Logs",
              "icono": "circle",
              "nombre": "Logs",
              "accion": "",
              "clase": "item",
              "color": "bg-c-blue",
              "Privilegios": []
            }
          ]
        },
        {
          "url": "options",
          "js": "",
          "icono": "settings",
          "descripcion": "Opciones",
          "nombre": "Opciones",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "options/update",
              "js": "",
              "descripcion": "Actualizar",
              "icono": "circle",
              "nombre": "Actualizar",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
              ]
            }
          ]
        },
        {
          "url": "github",
          "js": "",
          "icono": "settings",
          "descripcion": "Incidencias",
          "nombre": "Incidencias",
          "accion": "",
          "clase": "collapsible",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "github/issues",
              "js": "",
              "descripcion": "Registro",
              "icono": "circle",
              "nombre": "Registro",
              "accion": "",
              "clase": "item",
              "color": "bg-c-green",
              "Privilegios": [
                {
                  "metodo": "registrados",
                  "descripcion": "Registrados",
                  "accion": "Registrados()",
                  "directivas": ""
                }
              ]
            }
          ]
        }
      ]
    }
  },

  {
    "id": "Sicoex",
    "nombre": "Gestion de Documentos",
    "url": "http://localhost/bdv",
    "comentario": "Sistema de Credito Carterizado",
    "version": "V1.0.0.0",
    "autor": "Code-Epic Technologies",
    "Rol": {
      "descripcion": "Usuario Sistema",
      "Menu": [
        {
          "url": "/principal",
          "js": "",
          "icono": "icon-bdv-bank-l",
          "descripcion": "Principal",
          "nombre": "Principal",
          "accion": "",
          "clase": "text-primary",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/recibidos",
          "js": "",
          "icono": "icon-bdv-mail-l",
          "descripcion": "Recibidos",
          "nombre": "Recibidos",
          "accion": "",
          "clase": "text-primary",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/conformacionusuario",
          "js": "",
          "icono": "icon-bdv-location-l",
          "descripcion": "Conformacion Usuario",
          "nombre": "Conformacion Usuario",
          "accion": "",
          "clase": "text-orange",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/tareaspendientes",
          "js": "",
          "icono": "icon-bdv-location-l",
          "descripcion": "En Seguimiento",
          "nombre": "En Seguimiento",
          "accion": "",
          "clase": "text-green",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/aprobado",
          "js": "",
          "icono": "icon-bdv-location-l",
          "descripcion": "Aprobación",
          "nombre": "Aprobacion",
          "accion": "",
          "clase": "text-orange",
          "color": "",
          "Privilegio": [],
          "SubMenu": []
        },
        {
          "url": "/conformacion",
          "js": "",
          "icono": "icon-bdv-location-l",
          "descripcion": "Conformacion",
          "nombre": "Conformacion",
          "accion": "",
          "clase": "text-orange",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
          ]
        },
        {
          "url": "/seguimiento",
          "js": "",
          "icono": "icon-bdv-file-l ",
          "descripcion": "Reportes",
          "nombre": "Reportes",
          "accion": "",
          "clase": "text-pink",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "/indicadores",
              "js": "",
              "descripcion": "Seguimiento",
              "icono": "fa fa-plus-circle",
              "nombre": "Seguimiento",
              "accion": "",
              "clase": "f-left",
              "color": "bg-c-green",
              "Privilegios": [
              
              ]
            },
            {
              "url": "/resumen",
              "js": "",
              "descripcion": "Expediente",
              "icono": "fa fa-plus-circle",
              "nombre": "Expediente",
              "accion": "",
              "clase": "f-left",
              "color": "bg-c-green",
              "Privilegios": [
              
              ]
            },
            {
              "url": "/control",
              "js": "",
              "descripcion": "Control / Gestion",
              "icono": "fa fa-plus-circle",
              "nombre": "Control / Gestion",
              "accion": "",
              "clase": "f-left",
              "color": "bg-c-green",
              "Privilegios": [
              
              ]
            }
          ]
        },
        {
          "url": "/administracion",
          "js": "",
          "icono": "icon-bdv-config-l",
          "descripcion": "Configurar",
          "nombre": "Configurar",
          "accion": "",
          "clase": "text-blue",
          "color": "",
          "Privilegio": [],
          "SubMenu": [
            {
              "url": "/documentos",
              "js": "",
              "descripcion": "Documentos",
              "icono": "fa fa-inbox",
              "nombre": "Documentos",
              "accion": "CargarUrl('negocio', 'neconsultar')",
              "clase": "f-left",
              "color": "bg-c-blue",
              "Privilegios": [
                {
                  "metodo": "aprobadas",
                  "descripcion": "Aprobadas",
                  "accion": "Aprobadas()",
                  "directivas": ""
                },
                {
                  "metodo": "rechazadas",
                  "descripcion": "Rechazar",
                  "accion": "Rechazar()",
                  "directivas": ""
                },
                {
                  "metodo": "anular",
                  "descripcion": "Pendientes",
                  "accion": "Pendientes()",
                  "directivas": ""
                }
              ]
            },
            {
              "url": "/productos",
              "js": "",
              "descripcion": "Productos",
              "icono": "fa fa-share",
              "nombre": "Productos",
              "accion": "CargarUrl('expedientes', 'actualizar')",
              "clase": "f-left",
              "color": "bg-c-pink",
              "Privilegios": [
                
              ]
            },
            {
              "url": "/agencias",
              "js": "",
              "descripcion": "Agencias / Regionales",
              "icono": "fa fa-envelope-open",
              "nombre": "Agencias / Regionales",
              "accion": "CargarUrl('expedientes', 'prestamos')",
              "clase": "f-left",
              "color": "bg-purple",
              "Privilegios": [
              
              ]
            },
            {
              "url": "/configreportes",
              "js": "",
              "descripcion": "Cuentas Contables / Productos",
              "icono": "fa fa-share",
              "nombre": "Cuentas Contables / Productos",
              "accion": "CargarUrl('expedientes', 'inactivar')",
              "clase": "f-left",
              "color": "bg-c-pink",
              "Privilegios": [
              
              ]
            }
          ]
        }
      ]
    }
  }

]