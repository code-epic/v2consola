import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  signal,
  computed,
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
import { ChartConfiguration, ChartData } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import * as jspdf from "jspdf";
import autoTable from "jspdf-autotable";

export interface VersionMetrica {
  version: string;
  ejecuciones: number;
  latencia_avg_s: number;
  latencia_max_s: number;
  latencia_min_s: number;
  cpu_avg: number;
  memoria_avg: number;
  ultima_ejecucion: string;
  total_usuarios: number;
}

export interface FuncionEstadistica {
  nombre_funcion: string;
  total_invocaciones: number;
  latencia_global_s: number;
  desglose_versiones: VersionMetrica[];
  expanded?: boolean;
}

export interface AppTelemetria {
  codigo_app: string;
  aplicacion: string;
  total_funciones: number;
  total_eventos: number;
  estadisticas_funciones: FuncionEstadistica[];
}

@Component({
  selector: "app-sensores",
  templateUrl: "./sensores.component.html",
  styleUrls: ["./sensores.component.scss"],
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
    BaseChartDirective,
  ],
})
export class SensoresComponent implements OnInit {
  public contentHeader: any;

  private _appData = signal<any>(null);
  get appData() {
    return this._appData();
  }

  private _loading = signal<boolean>(false);
  get loading() {
    return this._loading();
  }

  private _telemetriaApps = signal<AppTelemetria[]>([]);
  get telemetriaApps() {
    return this._telemetriaApps();
  }

  private _selectedAppIdx = signal<number>(0);
  get selectedAppIdx() {
    return this._selectedAppIdx();
  }

  // Filters & Sorting
  searchTextCtrl = new FormControl("");
  private _searchText = signal<string>("");
  private _latencyFilter = signal<"ALL" | "FAST" | "SLOW" | "CRITICAL">("ALL");
  get latencyFilter() {
    return this._latencyFilter();
  }

  private _sortBy = signal<"latencia" | "tiempoTotal" | "invocaciones" | "nombre">(
    "latencia",
  );
  get sortBy() {
    return this._sortBy();
  }

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
    id: "",
    aplicacion: "",
    version: "",
  };

  // Active Application Telemetry
  public activeAppSignal = computed<AppTelemetria | null>(() => {
    const apps = this._telemetriaApps();
    if (apps.length === 0) return null;
    const idx = this._selectedAppIdx();
    return apps[idx] || apps[0];
  });

  get activeApp(): AppTelemetria | null {
    return this.activeAppSignal();
  }

  // Filtered & Sorted Functions
  public filteredFuncionesSignal = computed<FuncionEstadistica[]>(() => {
    const app = this.activeAppSignal();
    if (!app || !Array.isArray(app.estadisticas_funciones)) return [];

    const search = this._searchText().toLowerCase().trim();
    const latFilter = this._latencyFilter();
    const sortKey = this._sortBy();

    const filtered = app.estadisticas_funciones.filter((f) => {
      if (
        search &&
        !(f.nombre_funcion || "").toLowerCase().includes(search) &&
        !(f.desglose_versiones || []).some((v) =>
          (v.version || "").toLowerCase().includes(search),
        )
      ) {
        return false;
      }

      const lat = f.latencia_global_s || 0;
      if (latFilter === "FAST" && lat >= 0.5) return false;
      if (latFilter === "SLOW" && (lat < 0.5 || lat >= 2)) return false;
      if (latFilter === "CRITICAL" && lat < 2) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "latencia") {
        return (b.latencia_global_s || 0) - (a.latencia_global_s || 0);
      }
      if (sortKey === "tiempoTotal") {
        return this.getFuncTotalTime(b) - this.getFuncTotalTime(a);
      }
      if (sortKey === "nombre") {
        return (a.nombre_funcion || "").localeCompare(b.nombre_funcion || "");
      }
      return (b.total_invocaciones || 0) - (a.total_invocaciones || 0);
    });
  });

  get filteredFunciones(): FuncionEstadistica[] {
    return this.filteredFuncionesSignal();
  }

  // Summary KPIs (SRE Latency & Bottleneck Focus)
  public kpiMetricsSignal = computed(() => {
    const app = this.activeAppSignal();
    if (!app || !app.estadisticas_funciones?.length) {
      return {
        totalEventos: app?.total_eventos || 0,
        totalFunciones: app?.total_funciones || 0,
        totalInvocaciones: 0,
        latenciaGlobalAvg: 0,
        latenciaMaxima: 0,
        funcionMasLenta: "N/A",
        tiempoTotalAcumulado: 0,
        rapidas: 0,
        moderadas: 0,
        criticas: 0,
      };
    }

    let latSum = 0;
    let totalInvocaciones = 0;
    let tiempoTotalAcumulado = 0;
    let latenciaMaxima = 0;
    let funcionMasLenta = "N/A";
    let rapidas = 0;
    let moderadas = 0;
    let criticas = 0;

    app.estadisticas_funciones.forEach((f) => {
      const lat = f.latencia_global_s || 0;
      const inv = f.total_invocaciones || 0;
      latSum += lat;
      totalInvocaciones += inv;
      tiempoTotalAcumulado += lat * inv;

      if (lat > latenciaMaxima) {
        latenciaMaxima = lat;
        funcionMasLenta = f.nombre_funcion || "N/A";
      }

      if (lat < 0.5) rapidas++;
      else if (lat < 2) moderadas++;
      else criticas++;
    });

    const fnCount = app.estadisticas_funciones.length;
    return {
      totalEventos: app.total_eventos || 0,
      totalFunciones: app.total_funciones || fnCount,
      totalInvocaciones,
      latenciaGlobalAvg: fnCount > 0 ? latSum / fnCount : 0,
      latenciaMaxima,
      funcionMasLenta,
      tiempoTotalAcumulado,
      rapidas,
      moderadas,
      criticas,
    };
  });

  get kpiMetrics() {
    return this.kpiMetricsSignal();
  }

  // Chart 1: Latency (Avg vs Max) for Top 8 Functions
  public latencyChartData: ChartData<"bar"> = { labels: [], datasets: [] };
  public latencyChartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${Number(ctx.parsed.y || 0).toFixed(3)} s`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        title: { display: true, text: "Segundos (s)", font: { size: 11 } },
      },
    },
  };

  // Chart 2: CPU & Memory Resource Consumption for Top 8 Functions
  public resourceChartData: ChartData<"bar"> = { labels: [], datasets: [] };
  public resourceChartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        title: { display: true, text: "Consumo Promedio", font: { size: 11 } },
      },
    },
  };

  // Chart 3: Invocations Distribution Doughnut
  public invocationsChartData: ChartData<"doughnut"> = {
    labels: [],
    datasets: [],
  };
  public invocationsChartOptions: ChartConfiguration<"doughnut">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "66%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchTextCtrl.valueChanges.subscribe((val) => {
      this._searchText.set(val || "");
      this.cdr.markForCheck();
    });

    this.route.params.subscribe((params) => {
      const appIdEncoded = params["id"];
      if (appIdEncoded) {
        try {
          this._appData.set(JSON.parse(atob(appIdEncoded)));
        } catch (e) {
          this._appData.set({ id: appIdEncoded, nombre: appIdEncoded });
        }
        this.cargarSensores();
      }
    });

    this.contentHeader = {
      headerTitle: "Sensores y Telemetría APM",
      actionButton: true,
      breadcrumb: [
        { name: "Inicio", link: "/" },
        { name: "Bitacora", link: "/investigation/binnacle" },
        { name: "Sensores", isCurrent: true },
      ],
    };
  }

  cargarSensores() {
    const appParam =
      this.appData?.id ||
      this.appData?.codigo_app ||
      this.appData?.codigo ||
      this.appData?.nombre ||
      this.appData?.aplicacion ||
      "";
    this._loading.set(true);
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_CSensors";
    this.xAPI.parametros = appParam;
    this.xAPI.aplicacion = appParam;
    this.xAPI.valores = {};

    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data: any) => {
        this._loading.set(false);
        const list: AppTelemetria[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.Cuerpo)
            ? data.Cuerpo
            : data && typeof data === "object" && data.estadisticas_funciones
              ? [data]
              : [];

        const normalized = list.map((app) => ({
          ...app,
          estadisticas_funciones: (app.estadisticas_funciones || []).map((f) => ({
            ...f,
            expanded: false,
          })),
        }));

        const targetId = (
          this.appData?.id ||
          this.appData?.codigo_app ||
          this.appData?.codigo ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        const targetName = (
          this.appData?.nombre ||
          this.appData?.aplicacion ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();

        let matchedIdx = -1;
        if (normalized.length > 0 && (targetId || targetName)) {
          matchedIdx = normalized.findIndex((app) => {
            const code = (app.codigo_app || "").toString().trim().toLowerCase();
            const name = (app.aplicacion || "").toString().trim().toLowerCase();
            return (
              (targetId && (code === targetId || name === targetId)) ||
              (targetName && (name === targetName || code === targetName))
            );
          });

          if (matchedIdx === -1) {
            matchedIdx = normalized.findIndex((app) => {
              const code = (app.codigo_app || "").toString().trim().toLowerCase();
              const name = (app.aplicacion || "").toString().trim().toLowerCase();
              return (
                (targetId &&
                  (code.includes(targetId) || targetId.includes(code))) ||
                (targetName &&
                  (name.includes(targetName) || targetName.includes(name)))
              );
            });
          }
        }

        if (normalized.length > 1 && (targetId || targetName) && matchedIdx === -1) {
          this._telemetriaApps.set([]);
          this._selectedAppIdx.set(0);
        } else {
          this._telemetriaApps.set(normalized);
          this._selectedAppIdx.set(matchedIdx >= 0 ? matchedIdx : 0);
        }

        this.rebuildCharts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this._loading.set(false);
        console.error("[SensoresComponent] Error cargando _SYS_CSensors:", err);
        this.cdr.markForCheck();
      },
    });
  }

  selectAppIndex(idx: number) {
    this._selectedAppIdx.set(idx);
    this.rebuildCharts();
  }

  setLatencyFilter(filter: "ALL" | "FAST" | "SLOW" | "CRITICAL") {
    this._latencyFilter.set(filter);
  }

  setSortBy(sort: "latencia" | "tiempoTotal" | "invocaciones" | "nombre") {
    this._sortBy.set(sort);
  }

  toggleFunctionExpand(fn: FuncionEstadistica) {
    fn.expanded = !fn.expanded;
  }

  getFuncTotalTime(fn: FuncionEstadistica): number {
    return (fn.latencia_global_s || 0) * (fn.total_invocaciones || 0);
  }

  formatTotalTime(sec: number): string {
    if (!sec || sec <= 0) return "0 s";
    if (sec < 60) return `${sec.toFixed(1)} s`;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    if (mins < 60) return `${mins}m ${remSec.toFixed(0)}s`;
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    return `${hrs}h ${remMin}m`;
  }

  getLatencyBarPercent(sec: number): number {
    const max = this.kpiMetricsSignal().latenciaMaxima || 1;
    if (max <= 0) return 0;
    return Math.min(100, Math.max(4, Math.round(((sec || 0) / max) * 100)));
  }

  getSlaStatus(sec: number): string {
    if (!sec || sec < 0.5) return "ÓPTIMA (<0.5s)";
    if (sec < 2) return "MODERADA (0.5-2s)";
    return "CRÍTICA (>=2s)";
  }

  getFuncAvgCpu(fn: FuncionEstadistica): number {
    const vers = fn.desglose_versiones || [];
    if (vers.length === 0) return 0;
    const sum = vers.reduce((acc, v) => acc + (v.cpu_avg || 0), 0);
    return sum / vers.length;
  }

  getFuncAvgMem(fn: FuncionEstadistica): number {
    const vers = fn.desglose_versiones || [];
    if (vers.length === 0) return 0;
    const sum = vers.reduce((acc, v) => acc + (v.memoria_avg || 0), 0);
    return sum / vers.length;
  }

  getFuncMaxLat(fn: FuncionEstadistica): number {
    const vers = fn.desglose_versiones || [];
    if (vers.length === 0) return fn.latencia_global_s || 0;
    return Math.max(...vers.map((v) => v.latencia_max_s || 0));
  }

  getFuncMinLat(fn: FuncionEstadistica): number {
    const vers = fn.desglose_versiones || [];
    if (vers.length === 0) return fn.latencia_global_s || 0;
    return Math.min(...vers.map((v) => v.latencia_min_s || 0));
  }

  formatLatency(sec: number): string {
    if (!sec || sec <= 0) return "0 ms";
    if (sec < 1) return `${(sec * 1000).toFixed(1)} ms`;
    return `${sec.toFixed(3)} s`;
  }

  getLatencyBadgeClass(sec: number): string {
    if (!sec || sec < 0.5) return "badge-light-success";
    if (sec < 2) return "badge-light-warning";
    return "badge-light-danger";
  }

  private rebuildCharts() {
    const app = this.activeAppSignal();
    const allFuncs = [...(app?.estadisticas_funciones || [])];

    // Gráfica 1: Top 10 funciones con mayor latencia global (explica cuellos de botella)
    const slowestFuncs = [...allFuncs]
      .sort((a, b) => (b.latencia_global_s || 0) - (a.latencia_global_s || 0))
      .slice(0, 10);

    const latencyLabels = slowestFuncs.map((f) =>
      (f.nombre_funcion || "").length > 20
        ? f.nombre_funcion.slice(0, 20) + "…"
        : f.nombre_funcion,
    );

    this.latencyChartData = {
      labels: latencyLabels,
      datasets: [
        {
          label: "Latencia Global Prom. (s)",
          data: slowestFuncs.map((f) =>
            Number((f.latencia_global_s || 0).toFixed(4)),
          ),
          backgroundColor: "rgba(115, 103, 240, 0.82)",
          borderRadius: 6,
        },
        {
          label: "Pico Máximo (s)",
          data: slowestFuncs.map((f) =>
            Number(this.getFuncMaxLat(f).toFixed(4)),
          ),
          backgroundColor: "rgba(234, 84, 85, 0.68)",
          borderRadius: 6,
        },
      ],
    };

    // Gráfica 2: Top 6 funciones por volumen de invocaciones
    const topTraffic = [...allFuncs]
      .sort((a, b) => (b.total_invocaciones || 0) - (a.total_invocaciones || 0))
      .slice(0, 6);

    this.invocationsChartData = {
      labels: topTraffic.map((f) => f.nombre_funcion),
      datasets: [
        {
          data: topTraffic.map((f) => f.total_invocaciones || 0),
          backgroundColor: [
            "#7367f0",
            "#00cfe8",
            "#28c76f",
            "#ff9f43",
            "#ea5455",
            "#9c88ff",
          ],
          borderWidth: 0,
        },
      ],
    };
  }

  exportCSV() {
    const app = this.activeAppSignal();
    if (!app) return;
    const rows: any[] = [];
    (app.estadisticas_funciones || []).forEach((f) => {
      (f.desglose_versiones || []).forEach((v) => {
        rows.push({
          Aplicación: app.aplicacion || app.codigo_app,
          Función: f.nombre_funcion,
          "Invocaciones Totales": f.total_invocaciones,
          "Latencia Global (s)": f.latencia_global_s,
          Versión: v.version,
          Ejecuciones: v.ejecuciones,
          "Latencia Min (s)": v.latencia_min_s,
          "Latencia Avg (s)": v.latencia_avg_s,
          "Latencia Max (s)": v.latencia_max_s,
          "CPU Avg": v.cpu_avg,
          "Memoria Avg": v.memoria_avg,
          Usuarios: v.total_usuarios,
          "Última Ejecución": v.ultima_ejecucion,
        });
      });
    });

    if (rows.length === 0) return;
    const sep = ";";
    const keys = Object.keys(rows[0]);
    const csv =
      keys.join(sep) +
      "\n" +
      rows
        .map((r) =>
          keys
            .map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`)
            .join(sep),
        )
        .join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sensores_${(app.codigo_app || "App").replace(/\s+/g, "_")}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  exportPDF() {
    const app = this.activeAppSignal();
    if (!app) return;

    const kpi = this.kpiMetricsSignal();
    const funcs = [...(app.estadisticas_funciones || [])].sort(
      (a, b) => (b.latencia_global_s || 0) - (a.latencia_global_s || 0),
    );

    const doc = new jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const appName = app.aplicacion || app.codigo_app || "Aplicación";
    const nowStr = new Date().toLocaleString();

    // Encabezado SRE Corporativo
    doc.setFillColor(248, 248, 252);
    doc.rect(0, 0, pageWidth, 38, "F");
    doc.setDrawColor(115, 103, 240);
    doc.setLineWidth(0.8);
    doc.line(14, 38, pageWidth - 14, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(59, 55, 73);
    doc.text("REPORTE TÉCNICO SRE · TELEMETRÍA Y LATENCIA", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(115, 103, 240);
    doc.text(`Aplicación: ${appName} (${app.codigo_app || "N/A"})`, 14, 24);

    doc.setFontSize(8.5);
    doc.setTextColor(110, 107, 123);
    doc.text(`Generado: ${nowStr} · Fuente: sys-sensors (_SYS_CSensors)`, 14, 31);

    // Resumen Ejecutivo SRE (KPIs)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 55, 73);
    doc.text("1. Resumen Ejecutivo de Rendimiento (SLA & Latencia)", 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [["INDICADOR SRE", "VALOR", "DETALLE TÉCNICO"]],
      body: [
        [
          "Funciones Monitoreadas",
          String(kpi.totalFunciones),
          `${kpi.totalEventos.toLocaleString()} eventos totales en bitácora de sensores`,
        ],
        [
          "Total de Invocaciones",
          kpi.totalInvocaciones.toLocaleString(),
          `Tiempo acumulado de procesamiento: ${this.formatTotalTime(kpi.tiempoTotalAcumulado)}`,
        ],
        [
          "Latencia Promedio Global",
          this.formatLatency(kpi.latenciaGlobalAvg),
          `Óptimas (<0.5s): ${kpi.rapidas} | Moderadas (0.5-2s): ${kpi.moderadas} | Críticas (>=2s): ${kpi.criticas}`,
        ],
        [
          "Cuello de Botella Principal",
          this.formatLatency(kpi.latenciaMaxima),
          `Función más lenta: ${kpi.funcionMasLenta}`,
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 2.8,
        textColor: [65, 62, 78],
        lineColor: [232, 230, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [115, 103, 240],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 250, 253] },
    });

    // Sección 2: Top 10 Funciones por Latencia (Cuellos de Botella)
    const afterKpiY = (doc as any).lastAutoTable?.finalY || 105;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 55, 73);
    doc.text("2. Análisis de Latencia · Top 10 Procesos / APIs más Lentas", 14, afterKpiY + 10);

    const topSlowRows = funcs.slice(0, 10).map((f, idx) => [
      String(idx + 1),
      f.nombre_funcion,
      (f.total_invocaciones || 0).toLocaleString(),
      this.formatLatency(f.latencia_global_s),
      this.formatLatency(this.getFuncMinLat(f)),
      this.formatLatency(this.getFuncMaxLat(f)),
      this.formatTotalTime(this.getFuncTotalTime(f)),
      this.getSlaStatus(f.latencia_global_s),
    ]);

    autoTable(doc, {
      startY: afterKpiY + 14,
      head: [
        [
          "#",
          "FUNCIÓN / API",
          "INVOCACIONES",
          "LAT. PROM",
          "MÍN",
          "MÁX",
          "TIEMPO ACUM.",
          "ESTADO SLA",
        ],
      ],
      body: topSlowRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.8,
        cellPadding: 2.3,
        textColor: [65, 62, 78],
        lineColor: [232, 230, 240],
        lineWidth: 0.12,
      },
      headStyles: {
        fillColor: [241, 240, 251],
        textColor: [94, 88, 115],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [252, 252, 254] },
    });

    // Página 2+: Desglose Técnico por Versión de cada API
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 55, 73);
    doc.text("3. Inventario Técnico de APIs y Desglose por Versión", 14, 18);

    const detailRows: string[][] = [];
    funcs.forEach((f) => {
      const versiones = f.desglose_versiones || [];
      if (versiones.length === 0) {
        detailRows.push([
          f.nombre_funcion,
          "---",
          String(f.total_invocaciones || 0),
          this.formatLatency(f.latencia_global_s),
          "---",
          "---",
          "---",
          "---",
          this.getSlaStatus(f.latencia_global_s),
        ]);
      } else {
        versiones.forEach((v) => {
          const d = v.ultima_ejecucion ? new Date(v.ultima_ejecucion) : null;
          const fecha = d && !isNaN(d.getTime()) ? d.toLocaleString() : "---";
          detailRows.push([
            f.nombre_funcion,
            v.version || "---",
            String(v.ejecuciones || 0),
            this.formatLatency(v.latencia_avg_s),
            this.formatLatency(v.latencia_min_s),
            this.formatLatency(v.latencia_max_s),
            String(v.total_usuarios || 0),
            fecha,
            this.getSlaStatus(v.latencia_avg_s),
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: 23,
      head: [
        [
          "FUNCIÓN / API",
          "VERSIÓN",
          "EJEC.",
          "LAT. PROM",
          "MÍN",
          "MÁX",
          "USUARIOS",
          "ÚLT. EJECUCIÓN",
          "SLA",
        ],
      ],
      body: detailRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.2,
        cellPadding: 2,
        textColor: [65, 62, 78],
        lineColor: [232, 230, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [115, 103, 240],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(158, 155, 168);
      doc.text(
        `Reporte SRE · ${appName}`,
        14,
        pageHeight - 8,
      );
      doc.text(`Página ${i} / ${pageCount}`, pageWidth - 14, pageHeight - 8, {
        align: "right",
      });
    }

    const fileName = `SRE_Sensores_${(app.codigo_app || appName).replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    if (window.parent && window !== window.parent) {
      const pdfDataUri = doc.output("datauristring");
      window.parent.postMessage(
        {
          type: "OPEN_PDF",
          payload: {
            fileName,
            data: pdfDataUri,
          },
        },
        "*",
      );
    } else {
      doc.save(fileName);
    }
  }
}
