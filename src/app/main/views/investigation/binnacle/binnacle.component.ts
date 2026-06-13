import { Component, OnInit, ViewEncapsulation, NgZone, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";

@Component({
    selector: 'app-binnacle',
    templateUrl: './binnacle.component.html',
    styleUrls: ['./binnacle.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: "ecommerce-application" },
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgbModule,
        CoreCommonModule,
        CoreDirectivesModule,
        CorePipesModule,
        ContentHeaderComponent,
        NgSelectModule
    ]
})
export class BinnacleComponent implements OnInit {

  // Control de vista
  public isListView = false;
  public showSchema = false;

  // Modal / JSON de estructura
  public jsonEstructura = {
    "Usuario": "Userid (NM / CT) del Usuario autenticado en la Aplicación.",
    "Usuario SO": "Userid (NM / CT) del Usuario autenticado en el S.O.",
    "Fecha": "Fecha en que se graba el registro. Formato AAAAMMDD.",
    "Hora": "Hora en que se graba el registro. Formato Militar HH:MM:SS.",
    "IP": "Número de dirección IP del computador donde se realizó la acción.",
    "MAC": "Dirección física de la tarjeta de Red desde la cual se registra la acción.",
    "Computer Name": "Nombre del Computador a nivel de Windows donde se realizó la transacción.",
    "Tipo Actividad": "Login, Consulta, Incluir, Modificar, Eliminar.",
    "Resultado": "0 (Exitoso) o 1 (Fallido).",
    "Resultado Host": "Código que devuelve la transacción.",
    "Porción Libre": "Área para información adicional (Ej: Motivo de login fallido)."
  };

  searchType: string = "conexiones";
  searchTextCtrl = new FormControl('');
  get searchText() { return this.searchTextCtrl.value; }
  selectCustomSelectedCtrl = new FormControl([]);
  get selectCustomSelected() { return this.selectCustomSelectedCtrl.value; }

  public contentHeader: object;

  public ListarBitacora = [];
  public ListarAuditoriaLogs = [];
  private _loadingStreaming = signal<boolean>(false);
  get loadingStreaming() { return this._loadingStreaming(); }

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: '',
  };

  public page = 1;
  public pageSize = 10;
  public pageBasic = 1;
  filterActividadCtrl = new FormControl('');
  get filterActividad() { return this.filterActividadCtrl.value; }

  public developer = [];
  public rowData = [];
  public tempData = [];

  constructor(
    private ruta: Router,
    private apiService: ApiService,
    private zone: NgZone,
  ) { }


  async ngOnInit() {

    await this.CargarBitacora()

    this.contentHeader = {
      headerTitle: 'Investigación',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home',
          },
          {
            name: "Auditoria",
            isLink: false,
          },
          {
            name: 'Bitacora',
            isLink: false,
          },
        ],
      },
    };
  }

  irA(base: string, data: string) {
    const datoCodificado = btoa(JSON.stringify(data));
    this.ruta.navigate([base + '/' + datoCodificado]);
  }

  getMaterialIcon(nombre: string): string {
    const icons = [
      'apps', 'dashboard', 'terminal', 'memory', 'database',
      'developer_board', 'cloud', 'security', 'dns', 'bug_report',
      'api', 'integration_instructions', 'web', 'code', 'build'
    ];
    if (!nombre) return icons[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % icons.length;
    return icons[index];
  }

  async CargarBitacora() {
    this.ListarBitacora = [];
    this._loadingStreaming.set(true);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_LOGS;
    this.xAPI.parametros = ''

    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          this.ListarBitacora.push(row);
          this.rowData = this.ListarBitacora;
          this.tempData = this.rowData;
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.zone.run(() => {
        this._loadingStreaming.set(false);
      });
    }
  }

  async CargarReporteAuditoriaLogs(print: boolean = true) {
    this.ListarAuditoriaLogs = [];
    this._loadingStreaming.set(true);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_AUDITORIA_LOGS;
    this.xAPI.parametros = ''

    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          this.ListarAuditoriaLogs.push(row);
        });
      });
      
      if (print) {
        this.ImprimirReporteLog();
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.zone.run(() => {
        this._loadingStreaming.set(false);
      });
    }
  }

  // ==========================================
  // Exportación y Gestión Global
  // ==========================================

  ImprimirReporteLog() {
    if (this.ListarAuditoriaLogs.length === 0) return;

    // Generar Cabecera CSV
    let csvContent = "Usuario,Usuario_SO,Fecha,Hora,IP,MAC,Computer_Name,Tipo_Actividad,Resultado,Resultado_Host,Porcion_Libre\n";

    // Recorrer los datos de la bitácora actual para llenar el CSV
    this.ListarAuditoriaLogs.forEach(e => {
      const usuario = e.usuario || 'N/A'
      const userSo = e.usuarioSo || usuario
      const fecha = e.fecha || ''
      const hora = e.hora || ''
      const ip = e.ip || ''
      const mac = e.mac || ''
      const compName = e.computerName || ''
      const tipo = (e.tipo || '').toUpperCase()
      const result = e.resultado || ''
      const hostResult = e.resultadoHost || ''
      const libre = e.libre || ''

      // Limpiar comas para evitar saltos en CSV
      const cleanLibre = libre.replace(/,/g, ';');

      csvContent += `${usuario},${userSo},${fecha},${hora},${ip},${mac},${compName},${tipo},${result},${hostResult},${cleanLibre}\n`;
    });

    // Crear Data URI
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const fileName = `Reporte_Auditoria_Global_${new Date().getTime()}.csv`;

    // Enviar vía Puente (Sandbox)
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_CSV',
        payload: {
          fileName: fileName,
          data: dataUri
        }
      }, '*');
    } else {
      // Fallback
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  MostrarListadoGlobal() {
    // Alternar entre la vista de tarjetas y la vista de listado/tabla
    this.isListView = !this.isListView;
    this.page = 1;
    if (this.isListView) {
      this.CargarReporteAuditoriaLogs(false);
    }
  }



}
