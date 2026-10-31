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
  private _searchText = signal<string>('');
  get searchText() { return this._searchText(); }
  selectCustomSelectedCtrl = new FormControl([]);
  get selectCustomSelected() { return this.selectCustomSelectedCtrl.value; }

  public contentHeader: object;

  private _listarBitacora = signal<any[]>([]);
  get ListarBitacora() { return this._listarBitacora(); }
  set ListarBitacora(val: any[]) { this._listarBitacora.set(val); }

  private _listarAuditoriaLogs = signal<any[]>([]);
  get ListarAuditoriaLogs() { return this._listarAuditoriaLogs(); }
  set ListarAuditoriaLogs(val: any[]) { this._listarAuditoriaLogs.set(val); }

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
  private _filterActividad = signal<string>('');
  get filterActividad() { return this._filterActividad(); }

  public developer = [];
  public rowData = [];
  public tempData = [];

  constructor(
    private ruta: Router,
    private apiService: ApiService,
    private zone: NgZone,
  ) { }


  async ngOnInit() {
    this.searchTextCtrl.valueChanges.subscribe((val) => {
      this._searchText.set(val || '');
      this.page = 1;
    });
    this.filterActividadCtrl.valueChanges.subscribe((val) => {
      this._filterActividad.set(val || '');
      this.page = 1;
    });

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

  getCardMeta(nombre: string): { icon: string; colorClass: string } {
    const icons = [
      'grid', 'layout', 'terminal', 'cpu', 'database',
      'server', 'cloud', 'shield', 'hard-drive', 'activity',
      'code', 'layers', 'globe', 'box', 'tool'
    ];
    const colors = ['primary', 'success', 'warning', 'info'];
    if (!nombre) return { icon: icons[0], colorClass: colors[0] };
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    return {
      icon: icons[absHash % icons.length],
      colorClass: colors[absHash % colors.length]
    };
  }

  get filteredBitacora(): any[] {
    const term = (this.searchText || '').toLowerCase().trim();
    if (!term) return this.ListarBitacora;
    return this.ListarBitacora.filter(item =>
      (item.nombre || '').toLowerCase().includes(term) ||
      (item.comentario || '').toLowerCase().includes(term)
    );
  }

  get filteredAuditoriaLogs(): any[] {
    const term = (this.searchText || '').toLowerCase().trim();
    const act = (this.filterActividad || '').toLowerCase().trim();
    return this.ListarAuditoriaLogs.filter(item => {
      const matchUser = !term || (item.usuario || '').toLowerCase().includes(term);
      const matchAct = !act || (item.tipo || '').toLowerCase().includes(act);
      return matchUser && matchAct;
    });
  }

  async CargarBitacora() {
    this._listarBitacora.set([]);
    this._loadingStreaming.set(true);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_LOGS;
    this.xAPI.parametros = ''

    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        const meta = this.getCardMeta(row?.nombre);
        const enrichedRow = { ...row, _icon: meta.icon, _colorClass: meta.colorClass };
        this.zone.run(() => {
          this._listarBitacora.update(curr => [...curr, enrichedRow]);
          this.rowData = this._listarBitacora();
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
    this._listarAuditoriaLogs.set([]);
    this._loadingStreaming.set(true);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_AUDITORIA_LOGS;
    this.xAPI.parametros = ''

    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          this._listarAuditoriaLogs.update(curr => [...curr, row]);
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
