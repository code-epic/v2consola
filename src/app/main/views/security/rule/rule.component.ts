import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ApiService, IAPICore, IConfiguracion } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import jwt_decode from "jwt-decode";





@Component({
    selector: 'app-rule',
    templateUrl: './rule.component.html',
    styleUrls: ['./rule.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgbModule,
        NgSelectModule,
        ContentHeaderComponent,
        CoreDirectivesModule,
        CorePipesModule,
    ]
})
export class RuleComponent implements OnInit {

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

  public aplicacionSeleccionadaCtrl = new FormControl('');
  public configuracionEstatusCtrl = new FormControl(false);
  public configuracionSesionTiempoCtrl = new FormControl(300);
  public configuracionSesionUnidadCtrl = new FormControl('segundos');
  public configuracionEncriptamientoCtrl = new FormControl('SHA256');
  public configuracionEndpointsLoginCtrl = new FormControl('');
  public configuracionEndpointsOficinasCtrl = new FormControl('');
  public configuracionEndpointsEstadosCtrl = new FormControl('');
  public configuracionEndpointsDirectorioActivoCtrl = new FormControl('');
  public configuracionTrazaNivelCtrl = new FormControl('MEDIA');
  public configuracionAuditorNombreCtrl = new FormControl('');
  public configuracionAuditorNacionalidadCtrl = new FormControl('V');
  public configuracionAuditorCedulaCtrl = new FormControl('');
  public configuracionDirectorNombreCtrl = new FormControl('');
  public configuracionDirectorNacionalidadCtrl = new FormControl('V');
  public configuracionDirectorCedulaCtrl = new FormControl('');
  public configuracionMembreteL1Ctrl = new FormControl('');
  public configuracionMembreteL2Ctrl = new FormControl('');
  public configuracionMembreteL3Ctrl = new FormControl('');
  public configuracionCertificadoPassCtrl = new FormControl('');

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
            this.syncFormControlsFromConfig()
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
    this.syncConfigFromFormControls()
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


  syncFormControlsFromConfig() {
    if (!this.configuracion) return
    this.configuracionEstatusCtrl.setValue(this.configuracion.estatus === true)
    this.configuracionSesionTiempoCtrl.setValue(this.configuracion.sesion?.tiempo ?? 300)
    this.configuracionSesionUnidadCtrl.setValue(this.configuracion.sesion?.unidad ?? 'segundos')
    this.configuracionEncriptamientoCtrl.setValue(this.configuracion.encriptamiento ?? 'SHA256')
    this.configuracionEndpointsLoginCtrl.setValue(this.configuracion.endpoints?.login ?? '')
    this.configuracionEndpointsOficinasCtrl.setValue(this.configuracion.endpoints?.oficinas ?? '')
    this.configuracionEndpointsEstadosCtrl.setValue(this.configuracion.endpoints?.estados ?? '')
    this.configuracionEndpointsDirectorioActivoCtrl.setValue(this.configuracion.endpoints?.directorioActivo ?? '')
    this.configuracionTrazaNivelCtrl.setValue(this.configuracion.traza?.nivel ?? 'MEDIA')
    this.configuracionAuditorNombreCtrl.setValue(this.configuracion.auditor_nombre ?? '')
    this.configuracionAuditorNacionalidadCtrl.setValue(this.configuracion.auditor_nacionalidad ?? 'V')
    this.configuracionAuditorCedulaCtrl.setValue(this.configuracion.auditor_cedula ?? '')
    this.configuracionDirectorNombreCtrl.setValue(this.configuracion.director_nombre ?? '')
    this.configuracionDirectorNacionalidadCtrl.setValue(this.configuracion.director_nacionalidad ?? 'V')
    this.configuracionDirectorCedulaCtrl.setValue(this.configuracion.director_cedula ?? '')
    this.configuracionMembreteL1Ctrl.setValue(this.configuracion.membrete_l1 ?? '')
    this.configuracionMembreteL2Ctrl.setValue(this.configuracion.membrete_l2 ?? '')
    this.configuracionMembreteL3Ctrl.setValue(this.configuracion.membrete_l3 ?? '')
    this.configuracionCertificadoPassCtrl.setValue(this.configuracion.certificado_pass ?? '')
  }

  syncConfigFromFormControls() {
    if (!this.configuracion) return
    this.configuracion.estatus = !!this.configuracionEstatusCtrl.value
    if (this.configuracion.sesion) {
      this.configuracion.sesion.tiempo = this.configuracionSesionTiempoCtrl.value
      this.configuracion.sesion.unidad = this.configuracionSesionUnidadCtrl.value as 'horas' | 'minutos' | 'segundos'
    }
    this.configuracion.encriptamiento = this.configuracionEncriptamientoCtrl.value
    if (this.configuracion.endpoints) {
      this.configuracion.endpoints.login = this.configuracionEndpointsLoginCtrl.value
      this.configuracion.endpoints.oficinas = this.configuracionEndpointsOficinasCtrl.value
      this.configuracion.endpoints.estados = this.configuracionEndpointsEstadosCtrl.value
      this.configuracion.endpoints.directorioActivo = this.configuracionEndpointsDirectorioActivoCtrl.value
    }
    if (this.configuracion.traza) {
      this.configuracion.traza.nivel = this.configuracionTrazaNivelCtrl.value as 'BAJA' | 'MEDIA' | 'ALTA'
    }
    this.configuracion.auditor_nombre = this.configuracionAuditorNombreCtrl.value
    this.configuracion.auditor_nacionalidad = this.configuracionAuditorNacionalidadCtrl.value
    this.configuracion.auditor_cedula = this.configuracionAuditorCedulaCtrl.value
    this.configuracion.director_nombre = this.configuracionDirectorNombreCtrl.value
    this.configuracion.director_nacionalidad = this.configuracionDirectorNacionalidadCtrl.value
    this.configuracion.director_cedula = this.configuracionDirectorCedulaCtrl.value
    this.configuracion.membrete_l1 = this.configuracionMembreteL1Ctrl.value
    this.configuracion.membrete_l2 = this.configuracionMembreteL2Ctrl.value
    this.configuracion.membrete_l3 = this.configuracionMembreteL3Ctrl.value
    this.configuracion.certificado_pass = this.configuracionCertificadoPassCtrl.value
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
