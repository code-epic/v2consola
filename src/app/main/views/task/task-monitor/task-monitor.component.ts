import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgbModule, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import {
  NgxDatatableModule,
  ColumnMode,
  DatatableComponent,
} from '@swimlane/ngx-datatable';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { Subscription } from 'rxjs';
import {
  ApiService,
  ResumenRecognitionTools,
  BinarioToolInfo,
  AnalisisUsoTool,
  RecognitionToolDetailResponse,
} from '@services/apicore/api.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { TaskService } from '@services/apicore/task.service';

export interface TaskProcessRow {
  pid: string;
  programa: string;
  argumento: string;
  usuario: string;
  tiempo: string;
  estatus: boolean;
}

@Component({
  selector: 'app-task-monitor',
  templateUrl: './task-monitor.component.html',
  styleUrls: ['./task-monitor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgxDatatableModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent,
  ],
})
export class TaskMonitorComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public contentHeader: object;
  public ColumnMode = ColumnMode;

  // Navigation Tab: 'procesos' | 'herramientas'
  private _activeTab = signal<'procesos' | 'herramientas'>('procesos');
  get activeTab() {
    return this._activeTab();
  }

  // ==========================================
  // TAB 1: Procesos (sys-task / WebSocket PID)
  // ==========================================
  searchValueCtrl = new FormControl('');
  private _processSearch = signal<string>('');
  private _processStatusFilter = signal<'ALL' | 'RUNNING' | 'DONE'>('ALL');
  get processStatusFilter() {
    return this._processStatusFilter();
  }

  basicSelectedOptionCtrl = new FormControl(10);
  get basicSelectedOption() {
    return Number(this.basicSelectedOptionCtrl.value) || 10;
  }

  private _isLoading = signal<boolean>(false);
  get isLoading() {
    return this._isLoading();
  }

  private _allProcesses = signal<TaskProcessRow[]>([]);

  public processKpisSignal = computed(() => {
    const list = this._allProcesses();
    const running = list.filter((p) => p.estatus).length;
    return {
      total: list.length,
      running,
      done: list.length - running,
    };
  });
  get processKpis() {
    return this.processKpisSignal();
  }

  public filteredProcessesSignal = computed<TaskProcessRow[]>(() => {
    const list = this._allProcesses();
    const term = this._processSearch().toLowerCase().trim();
    const status = this._processStatusFilter();

    return list.filter((p) => {
      if (status === 'RUNNING' && !p.estatus) return false;
      if (status === 'DONE' && p.estatus) return false;
      if (!term) return true;
      return (
        (p.pid || '').toLowerCase().includes(term) ||
        (p.programa || '').toLowerCase().includes(term) ||
        (p.argumento || '').toLowerCase().includes(term) ||
        (p.usuario || '').toLowerCase().includes(term)
      );
    });
  });
  get rowData(): TaskProcessRow[] {
    return this.filteredProcessesSignal();
  }

  // ==========================================
  // TAB 2: Herramientas Sandra (recognition/tools)
  // ==========================================
  toolSearchCtrl = new FormControl('');
  private _toolSearch = signal<string>('');
  private _onlyActiveTools = signal<boolean>(false);
  get onlyActiveTools() {
    return this._onlyActiveTools();
  }

  private _loadingTools = signal<boolean>(false);
  get loadingTools() {
    return this._loadingTools();
  }

  private _toolsError = signal<string>('');
  get toolsError() {
    return this._toolsError();
  }

  private _toolsResumen = signal<ResumenRecognitionTools | null>(null);
  get toolsResumen() {
    return this._toolsResumen();
  }

  public filteredToolsSignal = computed<BinarioToolInfo[]>(() => {
    const resumen = this._toolsResumen();
    const list = resumen?.herramientas || [];
    const term = this._toolSearch().toLowerCase().trim();
    const onlyAct = this._onlyActiveTools();

    return list
      .filter((t) => {
        if (onlyAct && !t.activo) return false;
        if (!term) return true;
        return (
          (t.nombre || '').toLowerCase().includes(term) ||
          (t.ruta || '').toLowerCase().includes(term) ||
          (t.funciones_plataforma || []).some((fn) =>
            (fn.nombre || '').toLowerCase().includes(term),
          )
        );
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1;
        if (a.activo && b.activo) {
          const timeDiff =
            (b.tiempo_activo_max_seg || b.tiempo_activo_total_seg || 0) -
            (a.tiempo_activo_max_seg || a.tiempo_activo_total_seg || 0);
          if (timeDiff !== 0) return timeDiff;
          if ((b.instancias_activas || 0) !== (a.instancias_activas || 0)) {
            return (b.instancias_activas || 0) - (a.instancias_activas || 0);
          }
        }
        if (a.ejecutable !== b.ejecutable) return a.ejecutable ? -1 : 1;
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
  });
  get filteredTools(): BinarioToolInfo[] {
    return this.filteredToolsSignal();
  }

  // Detalle / Análisis de Uso de Herramienta
  private _loadingDetail = signal<boolean>(false);
  get loadingDetail() {
    return this._loadingDetail();
  }

  private _selectedTool = signal<BinarioToolInfo | null>(null);
  get selectedTool() {
    return this._selectedTool();
  }

  private _selectedToolUsage = signal<AnalisisUsoTool | null>(null);
  get selectedToolUsage() {
    return this._selectedToolUsage();
  }

  private _detailSubTab = signal<'procesos' | 'funciones' | 'uso'>('uso');
  get detailSubTab() {
    return this._detailSubTab();
  }

  private _lastDetailSync = signal<Date | null>(null);
  get lastDetailSync() {
    return this._lastDetailSync();
  }

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private msjService: WsocketsService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Monitoreo de Procesos',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Home', isLink: true, link: '/home' },
          { name: 'Tareas', isLink: false },
          { name: 'Monitoreo de Procesos', isLink: false },
        ],
      },
    };

    this.subs.push(
      this.route.queryParams.subscribe((params) => {
        if (params['tab'] === 'herramientas') {
          this.setTab('herramientas');
        }
      }),
      this.searchValueCtrl.valueChanges.subscribe((val) => {
        this._processSearch.set(val || '');
        if (this.table) this.table.offset = 0;
        this.cdr.markForCheck();
      }),
      this.toolSearchCtrl.valueChanges.subscribe((val) => {
        this._toolSearch.set(val || '');
        this.cdr.markForCheck();
      }),
    );

    this.initProcess();
    this.escucharPID();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  setTab(tab: 'procesos' | 'herramientas') {
    this._activeTab.set(tab);
    if (tab === 'herramientas' && !this._toolsResumen() && !this._loadingTools()) {
      this.cargarHerramientas();
    }
  }

  setProcessStatusFilter(filter: 'ALL' | 'RUNNING' | 'DONE') {
    this._processStatusFilter.set(filter);
    if (this.table) this.table.offset = 0;
  }

  escucharPID() {
    this.subs.push(
      this.msjService.lstpid$.subscribe((pid) => {
        if (pid && !pid.estatus && pid.id) {
          this.buscarElemento(pid.id);
        }
      }),
    );
  }

  async initProcess() {
    this._isLoading.set(true);
    try {
      const lst = await this.taskService.keys();
      if (!lst || lst.length === 0) {
        this._allProcesses.set([]);
        return;
      }

      const items = await Promise.all(
        lst.map(async (e: string) => {
          const data = await this.taskService.get(e);
          if (!data) return null;
          return {
            pid: (data.id || '').substring(0, 6),
            programa: data.funcion || '---',
            argumento: data.nombre || '---',
            usuario: data.usuario || 'sistema',
            tiempo:
              data.fin == undefined
                ? 'En ejecución'
                : new Date(data.fin).toUTCString().substring(0, 16),
            estatus: !!data.estatus,
          } as TaskProcessRow;
        }),
      );

      this._allProcesses.set(items.filter((x): x is TaskProcessRow => x !== null));
    } catch (error) {
      console.error('[TaskMonitor] Error cargando procesos:', error);
    } finally {
      this._isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  buscarElemento(pid: string) {
    const prefix = pid.substring(0, 6);
    this._allProcesses.update((list) =>
      list.map((e) =>
        e.pid === prefix
          ? {
              ...e,
              tiempo: new Date().toUTCString().substring(0, 16),
              estatus: false,
            }
          : e,
      ),
    );
    this.cdr.markForCheck();
  }

  // ==========================================
  // Métodos Recognition Tools (Sandra API)
  // ==========================================
  cargarHerramientas() {
    this._loadingTools.set(true);
    this._toolsError.set('');

    this.apiService.GetRecognitionTools().subscribe({
      next: (res: any) => {
        this._loadingTools.set(false);
        const payload: ResumenRecognitionTools =
          res?.contenido ?? res?.Contenido ?? res;
        if (payload && Array.isArray(payload.herramientas)) {
          this._toolsResumen.set(payload);
        } else {
          this._toolsResumen.set(null);
          this._toolsError.set(
            res?.msj ||
              res?.Msj ||
              'La respuesta de recognition/tools no contiene herramientas.',
          );
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this._loadingTools.set(false);
        this._toolsError.set(
          err?.error?.msj ||
            err?.error?.Msj ||
            'No se pudo consultar el servicio recognition/tools en Sandra.',
        );
        console.error('[TaskMonitor] Error recognition/tools:', err);
        this.cdr.markForCheck();
      },
    });
  }

  toggleOnlyActiveTools() {
    this._onlyActiveTools.update((v) => !v);
  }

  setDetailSubTab(tab: 'procesos' | 'funciones' | 'uso') {
    this._detailSubTab.set(tab);
  }

  verDetalleHerramienta(tool: BinarioToolInfo, preserveTab: boolean = false) {
    this._selectedTool.set(tool);
    if (!preserveTab) {
      this._selectedToolUsage.set(null);
      this._detailSubTab.set(tool.activo ? 'procesos' : 'uso');
    }
    this._loadingDetail.set(true);

    this.apiService.GetRecognitionToolDetail(tool.nombre).subscribe({
      next: (res: any) => {
        this._loadingDetail.set(false);
        this._lastDetailSync.set(new Date());
        const detail: RecognitionToolDetailResponse =
          res?.contenido ?? res?.Contenido ?? res;
        if (detail?.herramienta) {
          this._selectedTool.set(detail.herramienta);
          this._toolsResumen.update((curr) => {
            if (!curr) return curr;
            const herramientas = curr.herramientas.map((h) =>
              h.nombre === detail.herramienta.nombre ? detail.herramienta : h,
            );
            const activos = herramientas.filter((h) => h.activo).length;
            const cpuTotal = Number(
              herramientas
                .reduce((acc, h) => acc + (h.activo ? h.cpu_total_porcentaje : 0), 0)
                .toFixed(2),
            );
            const memTotalKB = herramientas.reduce(
              (acc, h) => acc + (h.activo ? h.mem_total_kb : 0),
              0,
            );
            return {
              ...curr,
              herramientas,
              activos,
              inactivos: herramientas.length - activos,
              cpu_total_porcentaje: cpuTotal,
              mem_total_kb: memTotalKB,
            };
          });
        }
        if (detail?.uso) {
          this._selectedToolUsage.set(detail.uso);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this._loadingDetail.set(false);
        console.error('[TaskMonitor] Error detalle tool:', err);
        this.cdr.markForCheck();
      },
    });
  }

  verUsoGlobal() {
    this._selectedTool.set(null);
    this._loadingDetail.set(true);
    this._detailSubTab.set('uso');

    this.apiService.GetRecognitionToolUsage('all', 50).subscribe({
      next: (res: any) => {
        this._loadingDetail.set(false);
        this._lastDetailSync.set(new Date());
        const uso: AnalisisUsoTool = res?.contenido ?? res?.Contenido ?? res;
        if (uso) {
          this._selectedToolUsage.set(uso);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this._loadingDetail.set(false);
        console.error('[TaskMonitor] Error uso global:', err);
        this.cdr.markForCheck();
      },
    });
  }

  refrescarDetalle() {
    const tool = this._selectedTool();
    if (tool) {
      this.verDetalleHerramienta(tool, true);
    } else if (this._selectedToolUsage()) {
      this.verUsoGlobal();
    }
  }

  cerrarDetalle() {
    this._selectedTool.set(null);
    this._selectedToolUsage.set(null);
    this._lastDetailSync.set(null);
  }
}
