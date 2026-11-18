import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  NgZone,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import * as jspdf from "jspdf";
import autoTable from "jspdf-autotable";

export type TrazaLogLevel = "INFO" | "WARNING" | "ALERT";

export interface NormalizedTrazaLog {
  raw: any;
  fecha: any;
  fechaMs: number;
  accion: string;
  metodo: string;
  documento: string;
  hash: string;
  login: string;
  duracionSeg: number;
  level: TrazaLogLevel;
  searchBlob: string;
  expanded?: boolean;
}

@Component({
  selector: "app-traza",
  templateUrl: "./traza.component.html",
  styleUrls: ["./traza.component.scss"],
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
export class TrazaComponent implements OnInit, OnDestroy {
  @ViewChild("logScrollContainer") logScrollContainer?: ElementRef<HTMLElement>;

  public contentHeader: any;
  private _usuarios = signal<any[]>([]);
  get usuarios() {
    return this._usuarios();
  }
  private _selectedUser = signal<any>(null);
  get selectedUser() {
    return this._selectedUser();
  }

  private _logs = signal<NormalizedTrazaLog[]>([]);
  get logs() {
    return this._logs();
  }

  private _loadingLogs = signal<boolean>(false);
  get loadingLogs() {
    return this._loadingLogs();
  }

  private _currentStep = signal<number>(1);
  get currentStep() {
    return this._currentStep();
  }

  // Infinite Scroll / Progressive Rendering (Low-Medium Load)
  public BATCH_SIZE = 50;
  public readonly batchOptions = [25, 50, 100];
  private _visibleLimit = signal<number>(this.BATCH_SIZE);
  get visibleLimit() {
    return this._visibleLimit();
  }

  setBatchSize(size: number) {
    this.BATCH_SIZE = size;
    this._visibleLimit.set(Math.max(this._visibleLimit(), size));
  }

  get loadedPercent(): number {
    const total = this.filteredLogsSignal().length;
    if (total === 0) return 0;
    return Math.min(100, Math.round((this.visibleLogsSignal().length / total) * 100));
  }

  // Pagination for Users (Phase 1)
  public userPage: number = 1;
  public userPageSize: number = 25;

  // Filters
  searchTextCtrl = new FormControl("");
  fechaDesdeCtrl = new FormControl("");
  fechaHastaCtrl = new FormControl("");
  accionFilterCtrl = new FormControl("ALL");

  private _searchText = signal<string>("");
  get searchText() {
    return this._searchText();
  }

  private _levelFilter = signal<"ALL" | TrazaLogLevel>("ALL");
  get levelFilter() {
    return this._levelFilter();
  }

  private _accionFilter = signal<string>("ALL");
  get accionFilter() {
    return this._accionFilter();
  }

  private _fechaDesde = signal<string>("");
  private _fechaHasta = signal<string>("");

  // Streaming Batch Buffer
  private streamBuffer: NormalizedTrazaLog[] = [];
  private flushTimer: any = null;
  private streamSessionToken = 0;

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

  // Computed signals for O(N) single-pass performance
  public filteredLogsSignal = computed<NormalizedTrazaLog[]>(() => {
    const all = this._logs();
    if (all.length === 0) return [];

    const search = this._searchText().toLowerCase().trim();
    const lvl = this._levelFilter();
    const acc = this._accionFilter();
    const desdeStr = this._fechaDesde();
    const hastaStr = this._fechaHasta();

    const desdeMs = desdeStr
      ? new Date(`${desdeStr}T00:00:00`).getTime()
      : null;
    const hastaMs = hastaStr
      ? new Date(`${hastaStr}T23:59:59.999`).getTime()
      : null;

    if (!search && lvl === "ALL" && acc === "ALL" && !desdeMs && !hastaMs) {
      return all;
    }

    return all.filter((item) => {
      if (lvl !== "ALL" && item.level !== lvl) return false;
      if (acc !== "ALL" && item.accion !== acc) return false;
      if (desdeMs !== null && item.fechaMs < desdeMs) return false;
      if (hastaMs !== null && item.fechaMs > hastaMs) return false;
      if (search && !item.searchBlob.includes(search)) return false;
      return true;
    });
  });

  get filteredLogs(): NormalizedTrazaLog[] {
    return this.filteredLogsSignal();
  }

  public visibleLogsSignal = computed<NormalizedTrazaLog[]>(() => {
    return this.filteredLogsSignal().slice(0, this._visibleLimit());
  });

  get visibleLogs(): NormalizedTrazaLog[] {
    return this.visibleLogsSignal();
  }

  public levelCountsSignal = computed(() => {
    const all = this._logs();
    let info = 0;
    let warning = 0;
    let alert = 0;
    for (let i = 0; i < all.length; i++) {
      const l = all[i].level;
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

  public availableActionsSignal = computed<string[]>(() => {
    const all = this._logs();
    const set = new Set<string>();
    for (let i = 0; i < all.length; i++) {
      if (all[i].accion) set.add(all[i].accion);
    }
    return Array.from(set).sort();
  });

  get availableActions(): string[] {
    return this.availableActionsSignal();
  }

  public actionStatsSignal = computed(() => {
    const all = this._logs();
    if (all.length === 0) return [];
    const stats: Record<string, number> = {};
    for (let i = 0; i < all.length; i++) {
      const acc = all[i].accion || all[i].metodo || "SIN ACCIÓN";
      stats[acc] = (stats[acc] || 0) + 1;
    }
    const total = all.length;
    return Object.entries(stats)
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  });

  get actionStats() {
    return this.actionStatsSignal();
  }

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.searchTextCtrl.valueChanges.subscribe((val) => {
      this._searchText.set(val || "");
      this.userPage = 1;
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

    this.accionFilterCtrl.valueChanges.subscribe((val) => {
      this._accionFilter.set(val || "ALL");
      this.resetVisibleWindow();
    });

    this.route.params.subscribe((params) => {
      const appIdEncoded = params["id"];
      if (appIdEncoded) {
        try {
          this._appData.set(JSON.parse(atob(appIdEncoded)));
        } catch (e) {
          this._appData.set({ id: appIdEncoded, nombre: appIdEncoded });
        }
        this.cargarUsuarios();
      }
    });

    this.contentHeader = {
      headerTitle: "Investigación de Traza",
      actionButton: true,
      breadcrumb: [
        { name: "Inicio", link: "/" },
        { name: "Binnacle", link: "/investigation/binnacle" },
        { name: "Traza", isCurrent: true },
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
      },
      (error) => {
        console.error(error);
      },
    );
  }

  selectUser(user: any) {
    this._selectedUser.set(user);
    this.clearLogFilters();
    this.cargarLogs(user.login || user.usuario || user.cedula);
    this._currentStep.set(2);
  }

  get filteredUsers() {
    if (!this.searchText) return this.usuarios;
    const search = this.searchText.toLowerCase();
    return this.usuarios.filter(
      (user) =>
        user.nombre?.toLowerCase().includes(search) ||
        user.login?.toLowerCase().includes(search) ||
        user.perfil?.toLowerCase().includes(search),
    );
  }

  setLevelFilter(lvl: "ALL" | TrazaLogLevel) {
    this._levelFilter.set(lvl);
    this.resetVisibleWindow();
  }

  clearLogFilters() {
    this.searchTextCtrl.setValue("", { emitEvent: false });
    this.fechaDesdeCtrl.setValue("", { emitEvent: false });
    this.fechaHastaCtrl.setValue("", { emitEvent: false });
    this.accionFilterCtrl.setValue("ALL", { emitEvent: false });
    this._searchText.set("");
    this._fechaDesde.set("");
    this._fechaHasta.set("");
    this._accionFilter.set("ALL");
    this._levelFilter.set("ALL");
    this.resetVisibleWindow();
  }

  get hasActiveFilters(): boolean {
    return (
      !!this._searchText() ||
      this._levelFilter() !== "ALL" ||
      this._accionFilter() !== "ALL" ||
      !!this._fechaDesde() ||
      !!this._fechaHasta()
    );
  }

  private resetVisibleWindow() {
    this._visibleLimit.set(this.BATCH_SIZE);
    if (this.logScrollContainer?.nativeElement) {
      this.logScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  onLogScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (!el) return;
    const threshold = 120;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      this.loadMoreLogs();
    }
  }

  loadMoreLogs() {
    const total = this.filteredLogsSignal().length;
    const current = this._visibleLimit();
    if (current < total) {
      this._visibleLimit.set(Math.min(total, current + this.BATCH_SIZE));
    }
  }

  scrollToTopLogs() {
    if (this.logScrollContainer?.nativeElement) {
      this.logScrollContainer.nativeElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  toggleLogExpand(item: NormalizedTrazaLog) {
    item.expanded = !item.expanded;
  }

  classifyLogLevel(accionRaw: string): TrazaLogLevel {
    const acc = (accionRaw || "").toString().toUpperCase().trim();
    if (
      !acc ||
      acc === "SIN ACCIÓN" ||
      acc === "SIN ACCION" ||
      acc === "OTRO" ||
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

  private normalizeLogRow(row: any): NormalizedTrazaLog {
    const rawFecha = row?.fecha?.$date || row?.fecha || new Date();
    const fechaMs = new Date(rawFecha).getTime() || 0;
    const accion = (row?.accion || row?.metodo || "SIN ACCIÓN")
      .toString()
      .toUpperCase()
      .trim();
    const metodo = (row?.metodo || "").toString();
    const documento = (row?.documento || "---").toString();
    const hash = (row?.hash || "").toString();
    const login = (row?.login || "").toString();
    const duracionSeg = Number(row?.Duracion?.segundos || row?.segundos || 0);
    const level = this.classifyLogLevel(accion);

    return {
      raw: row,
      fecha: rawFecha,
      fechaMs,
      accion,
      metodo,
      documento,
      hash,
      login,
      duracionSeg,
      level,
      searchBlob:
        `${accion} ${metodo} ${documento} ${hash} ${login} ${level}`.toLowerCase(),
      expanded: false,
    };
  }

  formatDuration(ns: number): string {
    if (!ns || ns === 0) return "0.000";
    if (ns > 1000000) return (ns / 1000000000).toFixed(3);
    return ns.toFixed(3);
  }

  private clearFlushTimer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private flushStreamBuffer() {
    if (this.streamBuffer.length === 0) return;
    const batch = this.streamBuffer;
    this.streamBuffer = [];
    this.zone.run(() => {
      this._logs.update((current) => current.concat(batch));
    });
  }

  async cargarLogs(login: string) {
    const myToken = ++this.streamSessionToken;
    this.clearFlushTimer();
    this.streamBuffer = [];
    this._logs.set([]);
    this._visibleLimit.set(this.BATCH_SIZE);
    this._loadingLogs.set(true);

    try {
      const streamApi = {
        ...this.xAPI,
        funcion: environment.functions.CONSULTAR_APPS_USUARIO_LOGS,
        parametros: `${login}`,
      };

      await this.apiService.postStream<any>("crudstream", streamApi, (row) => {
        if (myToken !== this.streamSessionToken) return;
        this.streamBuffer.push(this.normalizeLogRow(row));

        if (this.streamBuffer.length >= 200) {
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
      });
    } catch (error) {
      console.error("[TrazaComponent] Error cargando logs:", error);
    } finally {
      this.clearFlushTimer();
      if (myToken === this.streamSessionToken) {
        this.flushStreamBuffer();
        this.zone.run(() => {
          this._loadingLogs.set(false);
        });
      }
    }
  }

  goToStep(step: number) {
    this._currentStep.set(step);
  }

  // =========================================================================
  // EXPORTACIONES (CSV, PDF, LOG)
  // =========================================================================

  private getExportTargetLogs(): NormalizedTrazaLog[] {
    const filtered = this.filteredLogsSignal();
    return filtered.length > 0 ? filtered : this._logs();
  }

  exportCSV() {
    const targetLogs = this.getExportTargetLogs();
    if (targetLogs.length === 0) return;

    const dataToExport = targetLogs.map((item) => ({
      "Fecha y Hora": this.formatDate(item.fecha),
      Tipo: item.level,
      Acción: item.accion || "SIN ACCIÓN",
      "Duración (s)": this.formatDuration(item.duracionSeg),
      Documento: (item.documento || "---").toUpperCase(),
    }));

    const safeName = (this.selectedUser?.nombre || "Auditoria").replace(
      /\s+/g,
      "_",
    );
    const filename = `Traza_${safeName}_${Date.now()}.csv`;
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
        .map((row) => {
          return keys
            .map((k) => {
              let cell =
                row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n|;)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
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
            payload: {
              fileName: filename,
              data: reader.result,
            },
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

  exportLOG() {
    const targetLogs = this.getExportTargetLogs();
    if (targetLogs.length === 0) return;

    const userLabel = `${this.selectedUser?.nombre || "Usuario"} (${this.selectedUser?.login || "N/A"})`;
    const appLabel = this.appData?.nombre || this.appData?.id || "N/A";
    const counts = this.levelCounts;

    const headerLines = [
      "# ==============================================================================",
      "# REPORTE DE TRAZA DE AUDITORIA (.LOG)",
      `# Usuario    : ${userLabel}`,
      `# Aplicacion : ${appLabel}`,
      `# Generado   : ${new Date().toISOString()}`,
      `# Registros  : ${targetLogs.length} (INFO=${counts.INFO}, WARNING=${counts.WARNING}, ALERT=${counts.ALERT})`,
      "# ==============================================================================",
      "",
    ];

    const bodyLines = targetLogs.map((item) => {
      const ts = this.formatLogTimestamp(item.fecha);
      const lvl = item.level.padEnd(7, " ");
      const acc = item.accion || "SIN ACCION";
      const dur = this.formatDuration(item.duracionSeg);
      const doc = (item.documento || "---").replace(/\r?\n/g, " ");
      const met = item.metodo ? ` | metodo="${item.metodo}"` : "";
      return `[${ts}] [${lvl}] [${acc}] duracion=${dur}s | doc="${doc}"${met}`;
    });

    const logContent = headerLines.concat(bodyLines).join("\n");
    const safeName = (this.selectedUser?.nombre || "Auditoria").replace(
      /\s+/g,
      "_",
    );
    const filename = `Traza_${safeName}_${Date.now()}.log`;

    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8;" });
    if (window.parent && window !== window.parent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.parent.postMessage(
          {
            type: "OPEN_LOG",
            payload: {
              fileName: filename,
              data: reader.result,
            },
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
    const targetLogs = this.getExportTargetLogs();
    if (targetLogs.length === 0) return;

    const doc = new jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // PAGINA 1: PORTADA
    doc.setFontSize(26);
    doc.setTextColor(100, 181, 246);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE TRAZA", pageWidth / 2, 80, { align: "center" });

    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    doc.setFontSize(18);
    doc.setTextColor(97, 97, 97);
    doc.text(
      (this.selectedUser?.nombre || "Usuario Desconocido").toUpperCase(),
      pageWidth / 2,
      100,
      { align: "center" },
    );

    doc.setFontSize(12);
    doc.setTextColor(117, 117, 117);
    doc.text(
      `Identificador: ${this.selectedUser?.login || "N/A"}`,
      pageWidth / 2,
      115,
      { align: "center" },
    );
    doc.text(
      `Aplicación Origen: ${this.appData?.nombre || "N/A"}`,
      pageWidth / 2,
      122,
      { align: "center" },
    );

    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(158, 158, 158);
    const note = `Este reporte contiene la traza de actividad detallada con un total de ${targetLogs.length} registros auditados.`;
    const splitNote = doc.splitTextToSize(note, pageWidth - 80);
    doc.text(splitNote, pageWidth / 2, 140, { align: "center" });

    // MÉTRICAS DE RENDIMIENTO
    let totalLatencia = 0;
    let countLatencia = 0;
    for (let i = 0; i < targetLogs.length; i++) {
      const seg = targetLogs[i].duracionSeg;
      const latencia = seg && typeof seg === "number" && seg < 1000 ? seg : 0;
      if (latencia > 0) {
        totalLatencia += latencia;
        countLatencia++;
      }
    }
    const avgLatency = countLatencia > 0 ? totalLatencia / countLatencia : 0;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 181, 246);
    doc.text("ANÁLISIS DE RENDIMIENTO", pageWidth / 2, 165, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(97, 97, 97);
    doc.text(
      `Latencia Media: ${this.formatDuration(avgLatency)}s`,
      pageWidth / 2,
      175,
      { align: "center" },
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(189, 189, 189);
    doc.text(
      `Generado el: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );

    // PAGINA 2+: TABLA DE ACTIVIDAD (máximo 5000 filas por PDF para evitar bloqueo del navegador)
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(100, 181, 246);
    doc.setFont("helvetica", "bold");
    doc.text("Historial de Actividad", 14, 20);

    const pdfRows = targetLogs.slice(0, 5000);
    const tableData = pdfRows.map((item) => [
      this.formatDate(item.fecha),
      item.level,
      item.accion || "SIN ACCIÓN",
      this.formatDuration(item.duracionSeg) + "s",
      (item.documento || "---").toUpperCase(),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["FECHA Y HORA", "TIPO", "ACCIÓN", "DURACIÓN", "DOCUMENTO"]],
      body: tableData,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        valign: "middle",
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97],
      },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 181, 246],
        fontStyle: "bold",
        halign: "left",
        lineWidth: 0.1,
        lineColor: [226, 232, 240],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, {
        align: "right",
      });
    }

    const fileName = `Traza_${(this.selectedUser?.nombre || "Auditoria").replace(/\s+/g, "_")}.pdf`;

    if (window.parent && window !== window.parent) {
      const pdfDataUri = doc.output("datauristring");
      window.parent.postMessage(
        {
          type: "OPEN_PDF",
          payload: {
            fileName: fileName,
            data: pdfDataUri,
          },
        },
        "*",
      );
    } else {
      doc.save(fileName);
    }
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "---" : d.toLocaleString();
  }

  private formatLogTimestamp(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "0000-00-00 00:00:00.000";
    const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }
}
