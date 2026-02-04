import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService, IAPICore, IConfiguracion } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import jwt_decode from "jwt-decode";





@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuleComponent implements OnInit {

  @BlockUI('section-block') sectionBlockUI: NgBlockUI;

  public contentHeader: object;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  // Propiedades para la nueva interfaz
  public lstAplicaciones = [];
  public aplicacionSeleccionada: string;
  public configuracion: IConfiguracion;

  public unidadesTiempo = [
    { id: 'horas', name: 'Horas', icon: 'clock' },
    { id: 'minutos', name: 'Minutos', icon: 'watch' },
    { id: 'segundos', name: 'Segundos', icon: 'watch' }
  ];

  public tiposEncriptamiento = [
    { id: 'MD5', name: 'MD5' },
    { id: 'SHA256', name: 'SHA256' },
    { id: 'SHA512', name: 'SHA512' }
  ];

  public token: any

  constructor(
    private apiService: ApiService,
    private utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.token = jwt_decode(sessionStorage.getItem("token"));

    this.contentHeader = {
      headerTitle: 'Reglas de Seguridad',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Principal', isLink: true, link: '/home' },
          { name: 'Seguridad', isLink: false },
          { name: 'Reglas', isLink: false },
        ],
      },
    };
    this.cargarAplicaciones();
  }

  async cargarAplicaciones() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACIONES;
    this.xAPI.parametros = '';
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAplicaciones = data.map((e) => {
          e.name = `${e.id}  (${e.nombre})`
          return e
        })
      },
      (error) => {
        console.error('Error cargando las aplicaciones:', error);
      }
    );
  }

  /**
   * Carga la configuración de seguridad para la aplicación seleccionada.
   * Se ejecuta cada vez que el usuario cambia la selección en el dropdown.
   * @param event - El evento de cambio del ng-select, contiene el ID de la app.
   */
  cargarConfiguracionApp(event: any) {
    if (!event) {
      this.configuracion = null;
      return;
    }

    const appId = event.id;
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.CONSULTAR_CONFIGURACION_APP; // Asumiendo que esta es tu función de backend
    this.xAPI.parametros = appId;
    this.xAPI.valores = {};

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          if (data.length > 0) {
            this.configuracion = data[0]
            return
          }
        }
        this.configuracion = this.crearConfiguracionDefecto(appId)
      },
      (error) => {
        console.error('Error al cargar la configuración de la aplicación:', error);
        this.utilService.AlertMini('top-end', 'error', 'No se pudo cargar la configuración.', 3000);
      }
    );
  }

  /**
   * Crea un objeto de configuración por defecto cuando no existe uno para la app.
   * @param appId - El ID de la aplicación.
   * @returns Un objeto de configuración por defecto.
   */
  crearConfiguracionDefecto(appId: string): IConfiguracion {

    return {
      id: appId,
      estatus: true,
      sesion: { tiempo: 300, unidad: 'segundos' },
      endpoints: { login: '', oficinas: '', estados: '', directorioActivo: '' },
      traza: { nivel: 'MEDIA' },
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString(),
      usuariocreado: this.token.Usuario.nombre,
      usuarioactualizado: this.token.Usuario.nombre,
      encriptamiento: 'SHA256',
      certificado_digital: '',
      certificado_pass: ''
    } as any;
  }

  /**
   * Guarda la configuración actual en la base de datos.
   */
  guardarConfiguracion() {
    this.configuracion.actualizado = new Date().toISOString();
    this.configuracion.usuarioactualizado = this.token.Usuario.nombre;

    const fnx = {
      coleccion: environment.colecciones.SYS_CONFIG,
      objeto: this.configuracion,
      donde: JSON.stringify({ id: this.configuracion.id }),
      driver: environment.driver.PRINCIPAL,
      upsert: true,
    };

    this.apiService.ExecColeccion(fnx).subscribe(
      () => {

        this.ActualizarTokens();
      },
      (error) => {
        console.error('Error al guardar la configuración:', error);
        this.utilService.AlertMini('top-end', 'error', 'Ocurrió un error al guardar.', 3000);
      }
    );
  }

  ActualizarTokens() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.ACTUALIZAR_TOKENS
    let app = this.configuracion
    this.xAPI.parametros = `${app.id},${this.convertirASegundos()},${this.convertirTraza(app.traza.nivel)},${app.traza.nivel}`
    this.xAPI.valores = {}

    this.apiService.Ejecutar(this.xAPI).subscribe(
      () => {
        this.utilService.AlertMini('top-end', 'success', '¡Configuración guardada exitosamente!', 3000);
      },
      (error) => {
        console.error('Error al guardar la configuración:', error)
        this.utilService.AlertMini('top-end', 'error', 'Ocurrió un error al guardar.', 3000)
      }
    )
  }


  convertirASegundos(): number {
    let tiempo = this.configuracion.sesion.tiempo
    let unidad = this.configuracion.sesion.unidad

    switch (unidad) {
      case 'horas':
        return tiempo * 60 * 60;
      case 'minutos':
        return tiempo * 60;
      case 'segundos':
        return tiempo;
      default:
        return tiempo;
    }

  }

  convertirTraza(tipo: string): number {

    switch (tipo) {
      case 'BAJA':
        return 1;
      case 'MEDIA':
        return 2;
      case 'ALTA':
        return 3;
    }

  }

  onFileChange(event: any, field: string) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.configuracion[field] = reader.result as string;
      };
    }
  }


}
