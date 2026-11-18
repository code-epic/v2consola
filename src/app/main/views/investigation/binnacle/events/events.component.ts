import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  NgZone,
  ChangeDetectorRef,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { NgbModule, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import { CompresionService } from "@services/util/compresion.service";
import { UtilService } from "@services/util/util.service";
import * as jspdf from "jspdf";
import autoTable from "jspdf-autotable";

export type EventLogLevel = "INFO" | "WARNING" | "ALERT";

export interface ILog {
  fecha: string;
  hash: string;
  segundos: number;
  formattedDuration?: string;
}

export interface IFuncion {
  costo_kb: string;
  ejecuciones: number;
  logs: ILog[];
  nombre_funcion: string;
  v: string;
  ultimaFecha?: string;
  ultimaFechaMs?: number;
  level?: EventLogLevel;
}

export interface IMetodoBitacora {
  funciones: IFuncion[];
  metodo: string | null;
  total_invocaciones: number;
  level?: EventLogLevel;
}

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.scss"],
  encapsulation: ViewEncapsulation.None,
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
  ],
})
export class EventComponent implements OnInit, OnDestroy {
  @ViewChild("eventsScrollContainer")
  eventsScrollContainer?: ElementRef<HTMLElement>;

  public contentHeader: any;

  // Pagination for Users (Phase 1)
  public userPage: number = 1;
  public userPageSize: number = 25;

  // View Mode ('log' = Lista tipo Log, 'patterns' = Agrupado por Método)
  public viewMode: "log" | "patterns" = "log";

  // Infinite Scroll / Progressive Rendering (Phase 2 & Modal)
  public BATCH_SIZE = 50;
  public readonly batchOptions = [25, 50, 100];
  private _visibleMethodsLimit = signal<number>(this.BATCH_SIZE);
  get visibleMethodsLimit() {
    return this._visibleMethodsLimit();
  }

  public modalVisibleLimit: number = 50;

  // Filters
  searchTextCtrl = new FormControl("");
  searchEventsCtrl = new FormControl("");
  fechaDesdeCtrl = new FormControl("");
  fechaHastaCtrl = new FormControl("");

  private _searchText = signal<string>("");
  get searchText() {
    return this._searchText();
  }

  private _searchEvents = signal<string>("");
  get searchEvents() {
    return this._searchEvents();
  }

  private _levelFilter = signal<"ALL" | EventLogLevel>("ALL");
  get levelFilter() {
    return this._levelFilter();
  }

  private _fechaDesde = signal<string>("");
  private _fechaHasta = signal<string>("");

  private _usuarios = signal<any[]>([]);
  get usuarios() {
    return this._usuarios();
  }
  set usuarios(val: any[]) {
    this._usuarios.set(val);
  }

  private _selectedUser = signal<any>(null);
  get selectedUser() {
    return this._selectedUser();
  }
  set selectedUser(val: any) {
    this._selectedUser.set(val);
  }

  private _listarBitacora = signal<IMetodoBitacora[]>([]);
  get ListarBitacora() {
    return this._listarBitacora();
  }
  set ListarBitacora(val: IMetodoBitacora[]) {
    this._listarBitacora.set(val);
  }

  private _currentStep = signal<number>(1);
  get currentStep() {
    return this._currentStep();
  }
  set currentStep(val: number) {
    this._currentStep.set(val);
  }

  private _loading = signal<boolean>(false);
  get loading() {
    return this._loading();
  }
  set loading(val: boolean) {
    this._loading.set(val);
  }

  public totalInvocations: number = 0;
  public totalFunctions: number = 0;
  public actionStats: any[] = [];
  public sreMetrics: any = {
    avgLatency: 0,
    maxLatency: 0,
    criticalCount: 0,
  };

  // Streaming Batch Buffer
  private streamBuffer: IMetodoBitacora[] = [];
  private flushTimer: any = null;
  private streamSessionToken = 0;

  // Modal State
  private _rowDataRegistros = signal<any[]>([]);
  get rowDataRegistros() {
    return this._rowDataRegistros();
  }
  set rowDataRegistros(val: any[]) {
    this._rowDataRegistros.set(val);
  }

  searchRegistrosCtrl = new FormControl("");
  private _searchRegistros = signal<string>("");
  get searchRegistros() {
    return this._searchRegistros();
  }

  public selectedLog: any = null;
  public decodedConsulta: string = "";
  public decodedContenido: string = "";
  public ObjDetalle: any = {};
  public currentFunctionData: IFuncion | null = null;
  private currentModalTemplate: any = null;

  public detailViewMode: "report" | "json" = "report";
  public parsedInput: {
    type: "JSON" | "MULTI_JSON" | "SQL" | "POST_PARAMS" | "TEXT";
    typeLabel: string;
    badgeClass: string;
    blocks: {
      title: string;
      isProjection?: boolean;
      entries: { key: string; value: string; isZero?: boolean }[];
      raw: string;
    }[];
    sqlText?: string;
    sqlHtml?: string;
  } = {
    type: "JSON",
    typeLabel: "JSON",
    badgeClass: "badge-light-primary",
    blocks: [],
  };

  public parsedOutput: {
    kind: "EMPTY" | "ARRAY" | "OBJECT" | "TEXT";
    totalRows: number;
    columns: string[];
    rows: Record<string, string>[];
    entries: { key: string; value: string }[];
    summaryText: string;
  } = {
    kind: "EMPTY",
    totalRows: 0,
    columns: [],
    rows: [],
    entries: [],
    summaryText: "Sin datos",
  };

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
    id: "",
    aplicacion: "",
    version: "",
  };

  private _appData = signal<any>(null);
  get appData() {
    return this._appData();
  }
  set appData(val: any) {
    this._appData.set(val);
  }

  // Computed signals for filtered patterns & progressive rendering
  public filteredBitacoraSignal = computed<IMetodoBitacora[]>(() => {
    const all = this._listarBitacora();
    if (all.length === 0) return [];

    const search = this._searchEvents().toLowerCase().trim();
    const lvl = this._levelFilter();
    const desdeStr = this._fechaDesde();
    const hastaStr = this._fechaHasta();

    const desdeMs = desdeStr
      ? new Date(`${desdeStr}T00:00:00`).getTime()
      : null;
    const hastaMs = hastaStr
      ? new Date(`${hastaStr}T23:59:59.999`).getTime()
      : null;

    if (!search && lvl === "ALL" && !desdeMs && !hastaMs) {
      return all;
    }

    const result: IMetodoBitacora[] = [];
    for (let i = 0; i < all.length; i++) {
      const m = all[i];
      if (lvl !== "ALL" && m.level !== lvl) continue;

      const methodMatchesSearch =
        !search || (m.metodo || "").toLowerCase().includes(search);

      const matchingFuncs = (m.funciones || []).filter((f) => {
        if (desdeMs !== null && (f.ultimaFechaMs || 0) < desdeMs) return false;
        if (hastaMs !== null && (f.ultimaFechaMs || 0) > hastaMs) return false;
        if (
          search &&
          !methodMatchesSearch &&
          !(f.nombre_funcion || "").toLowerCase().includes(search) &&
          !(f.v || "").toLowerCase().includes(search)
        ) {
          return false;
        }
        return true;
      });

      if (matchingFuncs.length > 0) {
        result.push({
          ...m,
          funciones: matchingFuncs,
        });
      }
    }
    return result;
  });

  get filteredBitacora(): IMetodoBitacora[] {
    return this.filteredBitacoraSignal();
  }

  public visibleBitacoraSignal = computed<IMetodoBitacora[]>(() => {
    return this.filteredBitacoraSignal().slice(0, this._visibleMethodsLimit());
  });

  get visibleBitacora(): IMetodoBitacora[] {
    return this.visibleBitacoraSignal();
  }

  public flattenedLogsSignal = computed<any[]>(() => {
    const blocks = this.filteredBitacoraSignal();
    const flat: any[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const m = blocks[i];
      const lvl = m.level || "ALERT";
      const metodo = (m.metodo || "SIN MÉTODO").toUpperCase();
      const funcs = m.funciones || [];
      for (let j = 0; j < funcs.length; j++) {
        const f = funcs[j];
        const logs = f.logs || [];
        for (let k = 0; k < logs.length; k++) {
          const l = logs[k];
          flat.push({
            fecha: l.fecha,
            fechaMs: new Date(l.fecha).getTime() || 0,
            level: lvl,
            metodo,
            nombre_funcion: f.nombre_funcion || "---",
            v: f.v || "1.0",
            segundos: l.segundos,
            formattedDuration: this.formatSeconds(l.segundos),
            hash: l.hash || "",
            rawLog: l,
            funcRef: f,
          });
        }
      }
    }
    flat.sort((a, b) => b.fechaMs - a.fechaMs);
    return flat;
  });

  get flattenedLogs(): any[] {
    return this.flattenedLogsSignal();
  }

  public visibleFlatLogsSignal = computed<any[]>(() => {
    return this.flattenedLogsSignal().slice(0, this._visibleMethodsLimit());
  });

  get visibleFlatLogs(): any[] {
    return this.visibleFlatLogsSignal();
  }

  public levelCountsSignal = computed(() => {
    const all = this._listarBitacora();
    let info = 0;
    let warning = 0;
    let alert = 0;
    for (let i = 0; i < all.length; i++) {
      const l = all[i].level || "ALERT";
      if (l === "INFO") info++;
      else if (l === "WARNING") warning++;
      else alert++;
    }
    return {
      ALL: all.length,
      INFO: info,
      WARNING: warning,
      ALERT: alert,
    };
  });

  get levelCounts() {
    return this.levelCountsSignal();
  }

  public eventLevelCountsSignal = computed(() => {
    const all = this.flattenedLogsSignal();
    let info = 0;
    let warning = 0;
    let alert = 0;
    for (let i = 0; i < all.length; i++) {
      const l = all[i].level;
      if (l === "INFO") info++;
      else if (l === "WARNING") warning++;
      else alert++;
    }
    return { ALL: all.length, INFO: info, WARNING: warning, ALERT: alert };
  });

  get eventLevelCounts() {
    return this.eventLevelCountsSignal();
  }

  get loadedPercent(): number {
    if (this.viewMode === "log") {
      const total = this.flattenedLogsSignal().length;
      if (total === 0) return 0;
      return Math.min(
        100,
        Math.round((this.visibleFlatLogsSignal().length / total) * 100),
      );
    }
    const total = this.filteredBitacoraSignal().length;
    if (total === 0) return 0;
    return Math.min(
      100,
      Math.round((this.visibleBitacoraSignal().length / total) * 100),
    );
  }

  setViewMode(mode: "log" | "patterns") {
    this.viewMode = mode;
    this.resetVisibleWindow();
  }

  inspectFlatLog(item: any, modal: any) {
    this.currentModalTemplate = null;
    this.currentFunctionData = item.funcRef;
    this.openDetail(
      { ...item.rawLog, formattedDuration: item.formattedDuration },
      modal,
    );
  }

  loadMoreModal() {
    if (this.modalVisibleLimit < this.filteredRegistros.length) {
      this.modalVisibleLimit = Math.min(
        this.filteredRegistros.length,
        this.modalVisibleLimit + 50,
      );
    }
  }

  get hasActiveEventFilters(): boolean {
    return (
      !!this._searchEvents() ||
      this._levelFilter() !== "ALL" ||
      !!this._fechaDesde() ||
      !!this._fechaHasta()
    );
  }

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilService: UtilService,
    private compresionService: CompresionService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchTextCtrl.valueChanges.subscribe((val) => {
      this._searchText.set(val || "");
      this.userPage = 1;
      this.cdr.markForCheck();
    });

    this.searchEventsCtrl.valueChanges.subscribe((val) => {
      this._searchEvents.set(val || "");
      this.resetVisibleWindow();
    });

    this.fechaDesdeCtrl.valueChanges.subscribe((val) => {
      this._fechaDesde.set(val || "");
      this.resetVisibleWindow();
    });

    this.fechaHastaCtrl.valueChanges.subscribe((val) => {
      this._fechaHasta.set(val || "");
      this.resetVisibleWindow();
    });

    this.searchRegistrosCtrl.valueChanges.subscribe((val) => {
      this._searchRegistros.set(val || "");
      this.modalVisibleLimit = 50;
      this.cdr.markForCheck();
    });

    this.route.params.subscribe((params) => {
      const appIdEncoded = params["id"];
      if (appIdEncoded) {
        try {
          this._appData.set(JSON.parse(atob(appIdEncoded)));
        } catch (e) {
          console.error("[EventComponent] Error decodificando appId:", e);
          this._appData.set({ id: appIdEncoded, nombre: appIdEncoded });
        }
        this.cargarUsuarios();
      }
    });

    this.contentHeader = {
      headerTitle: "Investigación de Eventos",
      actionButton: true,
      breadcrumb: [
        { name: "Inicio", link: "/" },
        { name: "Binnacle", link: "/investigation/binnacle" },
        { name: "Eventos", isCurrent: true },
      ],
    };
  }

  ngOnDestroy(): void {
    this.streamSessionToken++;
    this.clearFlushTimer();
  }

  private getColorClass(seed: string): string {
    const colors = ["primary", "success", "warning", "info"];
    if (!seed) return colors[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  classifyEventLevel(metodoRaw: string): EventLogLevel {
    const acc = (metodoRaw || "").toString().toUpperCase().trim();
    if (
      !acc ||
      acc === "OTRAS OPERACIONES" ||
      acc === "SIN MÉTODO" ||
      acc === "SIN ACCIÓN" ||
      acc === "OTROS" ||
      acc.includes("ELIMINAR") ||
      acc.includes("DELETE") ||
      acc.includes("BORRAR") ||
      acc.includes("REMOVE") ||
      acc.includes("ANULAR") ||
      acc.includes("ERROR") ||
      acc.includes("ALERT") ||
      acc.includes("FAIL")
    ) {
      return "ALERT";
    }
    if (
      acc.includes("UPDATE") ||
      acc.includes("ACTUALIZAR") ||
      acc.includes("MODIFICAR") ||
      acc.includes("EDITAR") ||
      acc.includes("INCLUIR") ||
      acc.includes("INSERT") ||
      acc.includes("CREAR") ||
      acc.includes("GUARDAR") ||
      acc.includes("PUT") ||
      acc.includes("PATCH") ||
      acc.includes("POST") ||
      acc.includes("WARNING")
    ) {
      return "WARNING";
    }
    if (
      acc.includes("CONSULTAR") ||
      acc.includes("CONSULTA") ||
      acc.includes("SELECT") ||
      acc.includes("LISTAR") ||
      acc.includes("BUSCAR") ||
      acc.includes("VER") ||
      acc.includes("LEER") ||
      acc.includes("GET") ||
      acc.includes("LOGIN") ||
      acc.includes("LOGOUT") ||
      acc.includes("DESCARGAR") ||
      acc.includes("INFO")
    ) {
      return "INFO";
    }
    return "ALERT";
  }

  cargarUsuarios() {
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_USUARIO;
    this.xAPI.parametros = this.appData.id;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any[]) => {
        if (!data) return;
        const enriched = data.map((u) => ({
          ...u,
          _colorClass: this.getColorClass(u.nombre || u.login || ""),
        }));
        this._usuarios.set(enriched);
        this.cdr.markForCheck();
      },
      (error) => console.error(error),
    );
  }

  selectUser(user: any) {
    this._selectedUser.set(user);
    this.clearEventFilters();
    this.cargarEventos(user.login || user.usuario || user.cedula);
    this._currentStep.set(2);
    this.cdr.markForCheck();
  }

  get filteredUsers() {
    const list = this.usuarios;
    if (!this.searchText) return list;
    const search = this.searchText.toLowerCase();
    return list.filter(
      (user) =>
        user.nombre?.toLowerCase().includes(search) ||
        user.login?.toLowerCase().includes(search) ||
        user.perfil?.toLowerCase().includes(search),
    );
  }

  get filteredRegistros() {
    const list = this.rowDataRegistros;
    if (!this.searchRegistros) return list;
    const search = this.searchRegistros.toLowerCase();
    return list.filter(
      (r) =>
        r.hash?.toLowerCase().includes(search) ||
        r.metodo?.toLowerCase().includes(search),
    );
  }

  get visibleModalRegistros() {
    return this.filteredRegistros.slice(0, this.modalVisibleLimit);
  }

  onModalScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      if (this.modalVisibleLimit < this.filteredRegistros.length) {
        this.modalVisibleLimit += 50;
      }
    }
  }

  setLevelFilter(lvl: "ALL" | EventLogLevel) {
    this._levelFilter.set(lvl);
    this.resetVisibleWindow();
  }

  clearEventFilters() {
    this.searchEventsCtrl.setValue("", { emitEvent: false });
    this.fechaDesdeCtrl.setValue("", { emitEvent: false });
    this.fechaHastaCtrl.setValue("", { emitEvent: false });
    this._searchEvents.set("");
    this._fechaDesde.set("");
    this._fechaHasta.set("");
    this._levelFilter.set("ALL");
    this.resetVisibleWindow();
  }

  setBatchSize(size: number) {
    this.BATCH_SIZE = size;
    this._visibleMethodsLimit.set(Math.max(this._visibleMethodsLimit(), size));
  }

  private resetVisibleWindow() {
    this._visibleMethodsLimit.set(this.BATCH_SIZE);
    if (this.eventsScrollContainer?.nativeElement) {
      this.eventsScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  onEventsScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      this.loadMoreEvents();
    }
  }

  loadMoreEvents() {
    const total =
      this.viewMode === "log"
        ? this.flattenedLogsSignal().length
        : this.filteredBitacoraSignal().length;
    const current = this._visibleMethodsLimit();
    if (current < total) {
      this._visibleMethodsLimit.set(Math.min(total, current + this.BATCH_SIZE));
    }
  }

  scrollToTopEvents() {
    if (this.eventsScrollContainer?.nativeElement) {
      this.eventsScrollContainer.nativeElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  private clearFlushTimer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private normalizeMethodBlock(row: IMetodoBitacora): IMetodoBitacora {
    if (!row.metodo || row.metodo.trim() === "") {
      row.metodo = "OTRAS OPERACIONES";
    }
    row.level = this.classifyEventLevel(row.metodo);

    if (row.funciones) {
      row.funciones.forEach((f) => {
        f.level = row.level;
        if (f.logs && f.logs.length > 0) {
          let latest = f.logs[0];
          for (let i = 1; i < f.logs.length; i++) {
            if (f.logs[i].fecha > latest.fecha) {
              latest = f.logs[i];
            }
          }
          f.ultimaFecha = latest.fecha;
          f.ultimaFechaMs = new Date(latest.fecha).getTime() || 0;
        }
      });
    }
    return row;
  }

  private flushStreamBuffer() {
    if (this.streamBuffer.length === 0) return;
    const batch = this.streamBuffer;
    this.streamBuffer = [];
    this.zone.run(() => {
      let addedInvocations = 0;
      let addedFunctions = 0;
      for (let i = 0; i < batch.length; i++) {
        addedInvocations += batch[i].total_invocaciones || 0;
        addedFunctions += batch[i].funciones ? batch[i].funciones.length : 0;
      }
      this.totalInvocations += addedInvocations;
      this.totalFunctions += addedFunctions;

      this._listarBitacora.update((curr) => {
        const next = curr.concat(batch);
        next.sort((a, b) => b.total_invocaciones - a.total_invocaciones);
        return next;
      });
      this.cdr.markForCheck();
    });
  }

  async cargarEventos(login: string) {
    const myToken = ++this.streamSessionToken;
    this.clearFlushTimer();
    this.streamBuffer = [];
    this._loading.set(true);
    this.totalInvocations = 0;
    this.totalFunctions = 0;
    this._listarBitacora.set([]);
    this._visibleMethodsLimit.set(this.BATCH_SIZE);

    const streamApi = {
      ...this.xAPI,
      funcion: "_SYS_CLogPatterns",
      parametros: login,
    };

    try {
      await this.apiService.postStream<IMetodoBitacora>(
        "crudstream",
        streamApi,
        (row) => {
          if (myToken !== this.streamSessionToken) return;
          this.streamBuffer.push(this.normalizeMethodBlock(row));

          if (this.streamBuffer.length >= 50) {
            this.clearFlushTimer();
            this.flushStreamBuffer();
          } else if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => {
              this.flushTimer = null;
              if (myToken === this.streamSessionToken) {
                this.flushStreamBuffer();
              }
            }, 150);
          }
        },
      );
    } catch (error) {
      console.error("[EventComponent] Stream Error:", error);
    } finally {
      this.clearFlushTimer();
      if (myToken === this.streamSessionToken) {
        this.flushStreamBuffer();
        this.zone.run(() => {
          this._loading.set(false);
          this.actualizarEstadisticas();
          this.cdr.markForCheck();
        });
      }
    }
  }

  actualizarEstadisticas() {
    const statsMap = new Map<string, number>();
    let total = 0;
    let totalLatencia = 0;
    let countLatencia = 0;
    let maxLat = 0;
    let criticals = 0;

    this.ListarBitacora.forEach((metodo) => {
      const nombreMetodo = metodo.metodo || "OTROS";
      statsMap.set(
        nombreMetodo,
        (statsMap.get(nombreMetodo) || 0) + metodo.total_invocaciones,
      );
      total += metodo.total_invocaciones;

      (metodo.funciones || []).forEach((f) => {
        (f.logs || []).forEach((l) => {
          const latencia =
            l.segundos && typeof l.segundos === "number" && l.segundos < 1000
              ? l.segundos
              : 0;
          if (latencia > 0) {
            totalLatencia += latencia;
            countLatencia++;
            if (latencia > maxLat) maxLat = latencia;
            if (latencia > 2) criticals++;
          }
        });
      });
    });

    this.actionStats = Array.from(statsMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    this.sreMetrics = {
      avgLatency: countLatencia > 0 ? totalLatencia / countLatencia : 0,
      maxLatency: maxLat,
      criticalCount: criticals,
    };
  }

  // =========================================================================
  // EXPORTACIONES (LOG, CSV, PDF)
  // =========================================================================

  exportLOG() {
    const blocks =
      this.filteredBitacoraSignal().length > 0
        ? this.filteredBitacoraSignal()
        : this.ListarBitacora;
    if (blocks.length === 0) return;

    const lines: string[] = [];
    let infoCount = 0;
    let warnCount = 0;
    let alertCount = 0;

    blocks.forEach((m) => {
      const lvl = m.level || this.classifyEventLevel(m.metodo || "");
      const metodo = (m.metodo || "SIN METODO").toUpperCase();
      (m.funciones || []).forEach((f) => {
        (f.logs || []).forEach((l) => {
          if (lvl === "INFO") infoCount++;
          else if (lvl === "WARNING") warnCount++;
          else alertCount++;

          const ts = this.formatLogTimestamp(l.fecha);
          const lvlPad = lvl.padEnd(7, " ");
          const dur = this.formatSeconds(l.segundos);
          const hash = l.hash || "---";
          lines.push(
            `[${ts}] [${lvlPad}] [${metodo}] funcion="${f.nombre_funcion || "---"}" | v="${f.v || "1.0"}" | duracion=${dur} | hash="${hash}"`,
          );
        });
      });
    });

    const userLabel = `${this.selectedUser?.nombre || "Usuario"} (${this.selectedUser?.login || "N/A"})`;
    const headerLines = [
      "# ==============================================================================",
      "# REPORTE DE EVENTOS SRE (.LOG)",
      `# Usuario    : ${userLabel}`,
      `# Aplicacion : ${this.appData?.nombre || this.appData?.id || "N/A"}`,
      `# Generado   : ${new Date().toISOString()}`,
      `# Registros  : ${lines.length} (INFO=${infoCount}, WARNING=${warnCount}, ALERT=${alertCount})`,
      "# ==============================================================================",
      "",
    ];

    const logContent = headerLines.concat(lines).join("\n");
    const safeName = (this.selectedUser?.nombre || "User").replace(/\s+/g, "_");
    const filename = `Eventos_SRE_${safeName}_${Date.now()}.log`;
    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8;" });

    if (window.parent && window !== window.parent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.parent.postMessage(
          {
            type: "OPEN_LOG",
            payload: { fileName: filename, data: reader.result },
          },
          "*",
        );
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  exportCSV() {
    const blocks =
      this.filteredBitacoraSignal().length > 0
        ? this.filteredBitacoraSignal()
        : this.ListarBitacora;
    const dataToExport: any[] = [];
    blocks.forEach((m) => {
      const lvl = m.level || this.classifyEventLevel(m.metodo || "");
      (m.funciones || []).forEach((f) => {
        (f.logs || []).forEach((l) => {
          dataToExport.push({
            Tipo: lvl,
            Método: m.metodo || "SIN MÉTODO",
            Función: f.nombre_funcion || "---",
            Versión: f.v || "---",
            Fecha: l.fecha || "---",
            "Latencia (s)": l.segundos ?? 0,
            Hash: l.hash || "---",
          });
        });
      });
    });

    if (dataToExport.length === 0) return;
    const safeName = (this.selectedUser?.nombre || "User").replace(/\s+/g, "_");
    const filename = `Reporte_Eventos_${safeName}_${Date.now()}.csv`;
    this.downloadCSV(dataToExport, filename);
  }

  downloadCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    const separator = ";";
    const keys = Object.keys(data[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      data
        .map((row) =>
          keys
            .map((k) => {
              let cell =
                row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell.toString().replace(/"/g, '""');
              return cell.search(/("|,|\n|;)/g) >= 0 ? `"${cell}"` : cell;
            })
            .join(separator),
        )
        .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    if (window.parent && window !== window.parent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.parent.postMessage(
          {
            type: "OPEN_CSV",
            payload: { fileName: filename, data: reader.result },
          },
          "*",
        );
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  exportPDF() {
    const blocks =
      this.filteredBitacoraSignal().length > 0
        ? this.filteredBitacoraSignal()
        : this.ListarBitacora;
    if (blocks.length === 0) return;

    const doc = new jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Portada
    doc.setFontSize(22);
    doc.setTextColor(115, 103, 240);
    doc.text("REPORTE DE AUDITORÍA SRE", pageWidth / 2, 50, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(
      `Análisis de Patrones: ${this.selectedUser?.nombre || "Usuario"}`,
      pageWidth / 2,
      65,
      { align: "center" },
    );
    doc.text(
      `Identificador: ${this.selectedUser?.login || "N/A"}`,
      pageWidth / 2,
      72,
      { align: "center" },
    );

    // Métricas Resumen
    doc.setFontSize(12);
    doc.text("RESUMEN DE RENDIMIENTO", 20, 100);
    doc.setFontSize(10);
    doc.text(`- Invocaciones Totales: ${this.totalInvocations}`, 25, 110);
    doc.text(
      `- Latencia Promedio: ${this.formatSeconds(this.sreMetrics.avgLatency)}`,
      25,
      117,
    );
    doc.text(
      `- Latencia Máxima: ${this.formatSeconds(this.sreMetrics.maxLatency)}`,
      25,
      124,
    );
    doc.text(
      `- Eventos Críticos (>2s): ${this.sreMetrics.criticalCount}`,
      25,
      131,
    );

    // Tabla de Funciones
    const tableData: any[] = [];
    blocks.forEach((m) => {
      const lvl = m.level || this.classifyEventLevel(m.metodo || "");
      (m.funciones || []).forEach((f) => {
        tableData.push([
          lvl,
          m.metodo || "SIN MÉTODO",
          f.nombre_funcion || "---",
          f.ejecuciones ?? 0,
          f.v || "---",
        ]);
      });
    });

    autoTable(doc, {
      startY: 150,
      head: [["TIPO", "MÉTODO", "FUNCIÓN", "EJECUCIONES", "VER"]],
      body: tableData.slice(0, 5000),
      theme: "striped",
      headStyles: { fillColor: [115, 103, 240] },
    });

    const fileName =
      `Auditoria_SRE_${this.selectedUser?.nombre || "User"}.pdf`.replace(
        / /g,
        "_",
      );

    if (window.parent && window !== window.parent) {
      const pdfDataUri = doc.output("datauristring");
      window.parent.postMessage(
        {
          type: "OPEN_PDF",
          payload: { fileName: fileName, data: pdfDataUri },
        },
        "*",
      );
    } else {
      doc.save(fileName);
    }
  }

  ModalExePlay(modal: any, data: IFuncion) {
    this.currentModalTemplate = modal;
    this.currentFunctionData = data;
    this.modalVisibleLimit = 50;
    this.rowDataRegistros = (data.logs || []).map((log) => ({
      ...log,
      formattedDuration: this.formatSeconds(log.segundos),
    }));

    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: true,
      keyboard: true,
    });
  }

  openDetail(log: any, modal: any) {
    this.selectedLog = log;
    this.xAPI.funcion = "_SYS_CLogPatternsHash";
    this.xAPI.parametros = log.hash;

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        if (!data) return;
        this.ObjDetalle = Array.isArray(data) ? data[0] : data;

        const rawConsulta = this.ObjDetalle.consulta
          ? this.decodificar(this.ObjDetalle.consulta)
          : "{}";
        this.decodedConsulta = rawConsulta;
        try {
          this.decodedConsulta = JSON.stringify(
            JSON.parse(rawConsulta),
            null,
            2,
          );
        } catch (e) {}

        if (this.ObjDetalle.contenido && this.ObjDetalle.contenido.Data) {
          let encodedData = this.ObjDetalle.contenido.Data.replace(/\s/g, "");
          try {
            const firstPass = atob(encodedData);
            if (firstPass.length > 3 && firstPass.substring(0, 3) === "H4s") {
              encodedData = firstPass;
            }
          } catch (e) {}

          const unzip = this.compresionService.descomprimirZip(encodedData);
          this.decodedContenido = unzip;

          if (unzip) {
            try {
              this.decodedContenido = JSON.stringify(
                JSON.parse(unzip),
                null,
                2,
              );
            } catch (e) {}
          } else {
            this.decodedContenido =
              "Error: No se pudo descomprimir el contenido.";
          }
        } else {
          this.decodedContenido = "{}";
        }

        this.analyzeTransactionInput(rawConsulta);
        this.analyzeTransactionOutput(this.decodedContenido);
        this.detailViewMode = "report";

        this.modalService.dismissAll();
        const modalRef = this.modalService.open(modal, {
          size: "xl",
          centered: true,
          backdrop: true,
          keyboard: true,
        });
        this.cdr.markForCheck();

        modalRef.result.then(
          () => this.reopenPrevious(),
          () => this.reopenPrevious(),
        );
      },
      (error) => console.error("[EventComponent] Detail Error:", error),
    );
  }

  private formatHumanValue(val: any): string {
    if (val === null || val === undefined) return "null";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "object") {
      const s = JSON.stringify(val);
      return s.length > 140 ? s.slice(0, 140) + "..." : s;
    }
    return val.toString();
  }

  private objectToEntries(
    obj: Record<string, any>,
  ): { key: string; value: string; isZero?: boolean }[] {
    return Object.entries(obj).map(([key, val]) => ({
      key,
      value: this.formatHumanValue(val),
      isZero: val === 0,
    }));
  }

  analyzeTransactionInput(raw: string) {
    const text = (raw || "").trim();
    if (!text || text === "{}") {
      this.parsedInput = {
        type: "JSON",
        typeLabel: "JSON Vacío",
        badgeClass: "badge-light-secondary",
        blocks: [],
      };
      return;
    }

    // 1. Detectar múltiples bloques JSON separados por ';' (e.g. {...};{...})
    if (/\}\s*;\s*\{/.test(text)) {
      const parts = text.split(/\}\s*;\s*\{/).map((p, idx, arr) => {
        let s = p.trim();
        if (idx > 0) s = "{" + s;
        if (idx < arr.length - 1) s = s + "}";
        return s;
      });
      const blocks = parts.map((part, idx) => {
        try {
          const parsed = JSON.parse(part);
          const entries =
            parsed && typeof parsed === "object" && !Array.isArray(parsed)
              ? this.objectToEntries(parsed)
              : [{ key: "Valor", value: this.formatHumanValue(parsed) }];
          const allProjection =
            entries.length > 0 &&
            entries.every((e) => e.value === "0" || e.value === "1");
          return {
            title:
              idx === 0
                ? "Filtro / Argumentos"
                : allProjection
                  ? "Proyección de Campos (Ocultos / Visibles)"
                  : `Bloque #${idx + 1}`,
            isProjection: allProjection,
            entries,
            raw: JSON.stringify(parsed, null, 2),
          };
        } catch {
          return {
            title: `Bloque #${idx + 1}`,
            entries: [{ key: "Contenido", value: part }],
            raw: part,
          };
        }
      });

      this.decodedConsulta = blocks.map((b) => b.raw).join("\n;\n");
      this.parsedInput = {
        type: "MULTI_JSON",
        typeLabel: `Multi-Bloque JSON (${blocks.length})`,
        badgeClass: "badge-light-primary",
        blocks,
      };
      return;
    }

    // 2. Detectar JSON único
    if (text.startsWith("{") || text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        const entries =
          parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? this.objectToEntries(parsed)
            : [{ key: "Elementos", value: this.formatHumanValue(parsed) }];
        this.parsedInput = {
          type: "JSON",
          typeLabel: "JSON Payload",
          badgeClass: "badge-light-primary",
          blocks: [
            {
              title: "Parámetros JSON",
              entries,
              raw: JSON.stringify(parsed, null, 2),
            },
          ],
        };
        return;
      } catch {}
    }

    // 3. Detectar SQL Query
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|WITH|CALL|EXEC|CREATE|ALTER|DROP)\b/i.test(text)) {
      const prettySql = this.formatSqlPretty(text);
      this.parsedInput = {
        type: "SQL",
        typeLabel: "Consulta SQL",
        badgeClass: "badge-light-info",
        blocks: [],
        sqlText: prettySql,
        sqlHtml: this.highlightSqlHtml(prettySql),
      };
      return;
    }

    // 4. Detectar Parámetros POST (key=val&...) o Pipe (|)
    if (text.includes("=") && text.includes("&")) {
      const params = new URLSearchParams(text);
      const entries: { key: string; value: string }[] = [];
      params.forEach((v, k) => entries.push({ key: k, value: v }));
      this.parsedInput = {
        type: "POST_PARAMS",
        typeLabel: "Parámetros POST",
        badgeClass: "badge-light-info",
        blocks: [{ title: "Campos POST / Form", entries, raw: text }],
      };
      return;
    }

    if (text.includes("|")) {
      const entries = text.split("|").map((v, i) => ({
        key: `Parámetro ${i + 1}`,
        value: v.trim() || "(vacío)",
      }));
      this.parsedInput = {
        type: "POST_PARAMS",
        typeLabel: "Parámetros Sandra (|)",
        badgeClass: "badge-light-info",
        blocks: [{ title: "Argumentos Posicionales", entries, raw: text }],
      };
      return;
    }

    // 5. Texto plano
    this.parsedInput = {
      type: "TEXT",
      typeLabel: "Texto / Expresión",
      badgeClass: "badge-light-secondary",
      blocks: [
        {
          title: "Entrada",
          entries: [{ key: "Valor", value: text }],
          raw: text,
        },
      ],
    };
  }

  private formatSqlPretty(sql: string): string {
    return sql
      .replace(/\s+/g, " ")
      .replace(
        /\s+(FROM|WHERE|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|JOIN|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|VALUES|SET|UNION ALL|UNION)\b/gi,
        "\n$1",
      )
      .replace(/\s+(AND|OR)\b/gi, "\n  $1")
      .trim();
  }

  private highlightSqlHtml(sql: string): string {
    const escaped = sql
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(/'([^']*)'/g, `<span class="sql-str">'$1'</span>`)
      .replace(
        /\b(SELECT|DISTINCT|FROM|WHERE|AND|OR|INNER|LEFT|RIGHT|FULL|OUTER|JOIN|ON|AS|IN|NOT|NULL|IS|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|WITH|UNION|ALL|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END)\b/gi,
        `<span class="sql-kw">$1</span>`,
      )
      .replace(/\b(\d+(?:\.\d+)?)\b/g, `<span class="sql-num">$1</span>`);
  }

  analyzeTransactionOutput(raw: string) {
    const text = (raw || "").trim();
    if (!text || text === "{}" || text === "[]") {
      this.parsedOutput = {
        kind: "EMPTY",
        totalRows: 0,
        columns: [],
        rows: [],
        entries: [],
        summaryText: "Sin datos de respuesta",
      };
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.Cuerpo)
          ? parsed.Cuerpo
          : null;

      if (arr) {
        if (arr.length === 0) {
          this.parsedOutput = {
            kind: "EMPTY",
            totalRows: 0,
            columns: [],
            rows: [],
            entries: [],
            summaryText: "0 registros devueltos",
          };
          return;
        }
        if (typeof arr[0] === "object" && arr[0] !== null) {
          const cols = Object.keys(arr[0]).slice(0, 6);
          const rows = arr.slice(0, 50).map((r: any) => {
            const rowObj: Record<string, string> = {};
            cols.forEach((c) => {
              const v = this.formatHumanValue(r[c]);
              rowObj[c] = v.length > 70 ? v.slice(0, 70) + "..." : v;
            });
            return rowObj;
          });
          this.parsedOutput = {
            kind: "ARRAY",
            totalRows: arr.length,
            columns: cols,
            rows,
            entries: [],
            summaryText: `${arr.length} registro(s) en respuesta`,
          };
          return;
        }
      }

      if (parsed && typeof parsed === "object") {
        const entries = this.objectToEntries(parsed);
        if (entries.length === 0) {
          this.parsedOutput = {
            kind: "EMPTY",
            totalRows: 0,
            columns: [],
            rows: [],
            entries: [],
            summaryText: "Objeto vacío ({})",
          };
          return;
        }
        this.parsedOutput = {
          kind: "OBJECT",
          totalRows: 1,
          columns: [],
          rows: [],
          entries,
          summaryText: `${entries.length} propiedad(es) devuelta(s)`,
        };
        return;
      }
    } catch {}

    this.parsedOutput = {
      kind: "TEXT",
      totalRows: 1,
      columns: [],
      rows: [],
      entries: [{ key: "Respuesta", value: text }],
      summaryText: "Respuesta de texto",
    };
  }

  reopenPrevious() {
    if (this.currentModalTemplate && this.currentFunctionData) {
      this.ModalExePlay(this.currentModalTemplate, this.currentFunctionData);
    }
  }

  formatSeconds(seconds: number): string {
    if (seconds === undefined || seconds === null) return "0.00ms";
    if (seconds < 0.000001) return (seconds * 1000000).toFixed(2) + "μs";
    if (seconds < 0.001) return (seconds * 1000).toFixed(2) + "ms";
    if (seconds < 1) return (seconds * 1000).toFixed(2) + "ms";
    return seconds.toFixed(2) + "s";
  }

  decodificar(cadena: string): string {
    try {
      return atob(cadena);
    } catch (e) {
      return "Error de decodificación";
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.utilService.AlertMini("top-end", "success", "Copiado", 1000);
    });
  }

  goToStep(step: number) {
    this._currentStep.set(step);
    this.cdr.markForCheck();
  }

  private formatLogTimestamp(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "0000-00-00 00:00:00.000";
    const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }
}
