import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { UtilService } from "@services/util/util.service";
import JSONFormatter from "json-formatter-js";
import Swal from "sweetalert2";
import { CommonModule } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { environment } from "environments/environment";

@Component({
  selector: "app-api-details",
  templateUrl: "./api-details.component.html",
  styleUrls: ["./api-details.component.scss"],
  encapsulation: ViewEncapsulation.None,
  host: { class: "ecommerce-application" },
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CoreDirectivesModule,
    CorePipesModule,
    NgbModule,
    NgSelectModule,
    CodemirrorModule,
    ContentHeaderComponent,
  ],
})
export class ApiDetailsComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    relacional: false,
    concurrencia: false,
    protocolo: "",
    ruta: "",
    retorna: false,
    migrar: false,
    modulo: "",
    valores: {},
    coleccion: "",
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: "",
    query: "",
    metodo: "",
    tipo: "",
    prioridad: "",
    entorno: "",
    logs: false,
    traza: false,
    columnas: "",
    prefijo: "",
  };

  public apiPromover: IAPICore = {
    funcion: "",
    entorno: "",
  };

  public contentHeader: object;
  public rutaURL: string = "";
  public xentorno: string = "";
  public resultado: any;
  public xresultado: any;

  public activeSection: "resumen" | "esquema" | "laboratorio" | "codigo" = "resumen";
  public isLoadingApi: boolean = false;
  public isExecuting: boolean = false;
  public executionTimeMs: number | null = null;

  // Lazy Autocomplete Switcher for Driver APIs
  public driverApis: any[] = [];
  public isLoadingDriverApis: boolean = false;
  public driverApisLoaded: boolean = false;
  public quickSwitchApiCtrl = new FormControl<any>(null);

  public codeTypeJsCtrl = new FormControl("");
  get codeTypeJs(): string {
    return this.codeTypeJsCtrl.value || "";
  }

  public xparametroCtrl = new FormControl("");
  get xparametro(): string {
    return this.xparametroCtrl.value || "";
  }

  public valoresCtrl = new FormControl("{\n  \n}");
  get valores(): string {
    return this.valoresCtrl.value || "";
  }

  public codeMirrorOptions: any = {
    lineNumbers: true,
    theme: "idea",
    mode: "javascript",
    lineWrapping: true,
  };

  public data: any;
  public urlControl = "";
  public driversAPP = "";
  public url = "";
  public parsedEntradas: any = null;

  public UpdateAPI = {};

  constructor(
    private rutaActiva: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilservice: UtilService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.rutaActiva.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this.rutaURL = params["id"] || "";
        this.urlControl = params["ruta"] || "";
        this.initRouteContext();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private initRouteContext(): void {
    let urlPath = "";
    if (this.urlControl) {
      try {
        const valor = atob(this.urlControl).split("|");
        this.driversAPP = valor[0] || "";
        this.url = valor[1] || "";
        urlPath = "/" + this.url;
      } catch (e) {
        urlPath = "";
      }
    }

    this.contentHeader = {
      headerTitle: "Detalle API REST",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Aplicaciones",
            isLink: true,
            link: "/tools/applications",
          },
          {
            name: this.url || "Api",
            isLink: true,
            link: "/tools/applications" + urlPath,
          },
          {
            name: this.driversAPP || "Catálogo",
            isLink: true,
            link: "/tools/applications/api-list/" + this.urlControl,
          },
          {
            name: this.rutaURL,
            isLink: false,
          },
        ],
      },
    };

    this.ConsultarAPI(this.rutaURL);
  }

  setSection(sec: "resumen" | "esquema" | "laboratorio" | "codigo"): void {
    this.activeSection = sec;
    this.cdr.detectChanges();

    if (sec === "resumen" || sec === "esquema") {
      setTimeout(() => this.renderEntradasJson(), 50);
    } else if (sec === "laboratorio") {
      this.prepareLabContext();
      if (this.xresultado) {
        setTimeout(() => this.renderResultadoJson("xrs-inline"), 50);
      }
    } else if (sec === "codigo") {
      this.generateCodeSnippet();
    }
  }

  ConsultarAPI(api: string): void {
    if (!api) return;
    this.isLoadingApi = true;
    const apiConnect = {
      funcion: environment.functions.LISTAR_APIS_ID,
      parametros: api,
    };
    this.apiService.Ejecutar(apiConnect).subscribe({
      next: (data) => {
        this.isLoadingApi = false;
        if (Array.isArray(data) && data.length > 0) {
          this.xAPI = data[0];
        }

        const apiPrefix = this.xAPI?.entorno === "produccion" ? "/v1/" : "/devel/";
        const endpointHash = this.xAPI?.id || (this.xAPI as any)?.hash || environment.Hash;
        this.xentorno = `${apiPrefix}api/crud:${endpointHash}`;
        this.data = this.xAPI;

        // Parse JSON string if needed
        let entradasData: any = this.xAPI?.entradas;
        if (typeof entradasData === "string" && entradasData.trim()) {
          try {
            entradasData = JSON.parse(entradasData);
          } catch (e) {
            entradasData = { raw: this.xAPI.entradas };
          }
        } else if (!entradasData) {
          entradasData = { info: "Esta API no define parámetros de entrada estructurados." };
        }
        this.parsedEntradas = entradasData;

        this.generateCodeSnippet();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.renderEntradasJson();
        }, 60);
      },
      error: (error) => {
        this.isLoadingApi = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  private renderEntradasJson(): void {
    const targets = ["xrsx", "xrsx-schema"];
    targets.forEach((id) => {
      const container = document.getElementById(id);
      if (container && this.parsedEntradas) {
        container.innerHTML = "";
        const formatter = new JSONFormatter(this.parsedEntradas, 2, {
          theme: "dark",
        });
        container.appendChild(formatter.render());
      }
    });
  }

  private renderResultadoJson(targetId: string): void {
    const container = document.getElementById(targetId);
    if (container && this.xresultado !== undefined) {
      container.innerHTML = "";
      const formatter = new JSONFormatter(this.xresultado, 2);
      container.appendChild(formatter.render());
    }
  }

  private prepareLabContext(): void {
    const apiPrefix = this.xAPI?.entorno === "produccion" ? "/v1/" : "/devel/";
    const endpointHash = this.xAPI?.id || (this.xAPI as any)?.hash || environment.Hash;
    this.xentorno = `${apiPrefix}api/crud:${endpointHash}`;
    this.data = this.xAPI;
  }

  limpiarResultadoLab(): void {
    this.xresultado = null;
    this.executionTimeMs = null;
    ["xrs", "xrs-inline"].forEach((id) => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = "";
    });
    this.cdr.detectChanges();
  }

  private generateCodeSnippet(): void {
    const fn = this.xAPI?.funcion || this.rutaURL;
    const drv = this.xAPI?.driver || this.driversAPP || "MGDBA";
    const col = this.xAPI?.coleccion || "";
    const snippet = `// Ejemplo de invocación en Angular con ApiService (Sandra Core)
const xAPI: IAPICore = {
  funcion: '${fn}',
  parametros: '${this.xparametro || ""}',
  valores: ${this.valores && this.valores.trim() !== "{\n  \n}" ? this.valores : "{}"},
  driver: '${drv}',${col ? `\n  coleccion: '${col}',` : ""}
  retorna: ${Boolean(this.xAPI?.retorna)}
};

this.apiService.Ejecutar(xAPI).subscribe({
  next: (data) => {
    console.log('Respuesta ${fn}:', data);
  },
  error: (err) => {
    console.error('Error ejecutando ${fn}:', err);
  }
});`;
    this.codeTypeJsCtrl.setValue(snippet, { emitEvent: false });
  }

  cargarPlantillaEntrada(): void {
    if (!this.parsedEntradas) return;
    try {
      const formatted = JSON.stringify(this.parsedEntradas, null, 2);
      this.valoresCtrl.setValue(formatted);
      this.utilservice.AlertMini("top-end", "info", "Mapa de entrada cargado en el editor", 2000);
    } catch (e) {
      // ignore
    }
  }

  formatearPayloadJson(): void {
    const raw = (this.valores || "").trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.valoresCtrl.setValue(JSON.stringify(parsed, null, 2));
    } catch (e) {
      this.utilservice.AlertMini("top-end", "warning", "El JSON ingresado no tiene un formato válido", 2500);
    }
  }

  /**
   * Carga lazy de las APIs del mismo driver solo cuando el usuario abre el selector de salto rápido
   */
  ensureDriverApisLoaded(): void {
    if (this.driverApisLoaded || this.isLoadingDriverApis || !this.driversAPP) {
      return;
    }
    this.isLoadingDriverApis = true;
    const req: IAPICore = {
      funcion: "_SYS_R_ListarApis",
      parametros: this.driversAPP,
      valores: "",
    };
    this.apiService.Ejecutar(req).subscribe({
      next: (data) => {
        this.isLoadingDriverApis = false;
        this.driverApisLoaded = true;
        if (Array.isArray(data)) {
          this.driverApis = data.map((e: any) => ({
            ...e,
            descripcion: e.descripcion ?? "",
            searchKey: `${e.funcion || ""} ${e.descripcion || ""} ${e.tipo || ""} ${e.entorno || ""}`.toLowerCase(),
          }));
        } else {
          this.driverApis = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingDriverApis = false;
        this.cdr.detectChanges();
      },
    });
  }

  customApiSearchFn = (term: string, item: any): boolean => {
    if (!term) return true;
    const q = term.toLowerCase().trim();
    if (item.searchKey) return item.searchKey.includes(q);
    return (
      (item.funcion || "").toLowerCase().includes(q) ||
      (item.descripcion || "").toLowerCase().includes(q)
    );
  };

  onQuickSwitchApi(item: any): void {
    if (!item || !item.funcion) return;
    this.quickSwitchApiCtrl.setValue(null, { emitEvent: false });
    this.router.navigate([
      "/tools/applications/api-details",
      item.funcion,
      this.urlControl,
    ]);
  }

  ModalProbar(modal: any, data: any): void {
    this.prepareLabContext();
    this.data = data || this.xAPI;
    this.generateCodeSnippet();
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal modal-pastel-card",
    });
  }

  async promover(entorno: string, funcion: string, _accion?: string) {
    await Swal.fire({
      title: "¿Está seguro de promover esta API?",
      html: `<strong class="text-danger">${funcion}</strong><br>Pasará al entorno de <strong>${entorno.toUpperCase()}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#334155",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Sí, Promover",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.PromoverAPI(funcion, entorno);
      }
    });
  }

  ejecutarApi(): void {
    this.isExecuting = true;
    this.executionTimeMs = null;
    const startTime = performance.now();

    const payloadReq: IAPICore = {
      ...(this.data || this.xAPI),
      parametros: this.xparametro,
      valores: this.valores,
    };

    this.generateCodeSnippet();

    this.apiService.Ejecutar(payloadReq).subscribe({
      next: (data) => {
        this.isExecuting = false;
        this.executionTimeMs = Math.round(performance.now() - startTime);
        if (data !== null) {
          this.utilservice.AlertMini("top-end", "success", "Consulta ejecutada con éxito", 2500);
          this.xresultado = data;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.renderResultadoJson("xrs");
            this.renderResultadoJson("xrs-inline");
          }, 30);
        } else {
          this.xresultado = null;
          this.utilservice.AlertMini("top-end", "warning", "La API respondió NULL", 3000);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isExecuting = false;
        this.executionTimeMs = Math.round(performance.now() - startTime);
        this.xresultado = error;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.renderResultadoJson("xrs");
          this.renderResultadoJson("xrs-inline");
        }, 30);
      },
    });
  }

  PromoverAPI(funcion: string, entorno: string): void {
    this.apiPromover.entorno = entorno;
    this.apiPromover.funcion = funcion;
    const jsonG: any = {
      coleccion: "apicore",
      relacional: false,
      tipo: "INSERTAR",
      entorno: entorno,
      valores: this.apiPromover,
    };
    const sApi = "crud";
    this.apiService.Guardar(jsonG, sApi).subscribe({
      next: (data) => {
        this.ConsultarAPI(this.rutaURL);
        const id =
          data?.UpsertedID != null
            ? "registrada código: " + data.UpsertedID
            : "actualizada";
        this.utilservice.AlertMini("top-end", "success", `Tu API ha sido ${id}`, 3000);
      },
      error: () => {
        this.utilservice.AlertMini("top-end", "error", "Falló la conexión con el API", 3000);
      },
    });
  }

  exportResultadoJSON(): void {
    if (!this.xresultado) {
      this.utilservice.AlertMini("top-end", "warning", "No hay datos para exportar", 3000);
      return;
    }

    const filename = `export_api_${this.xAPI.funcion || this.xAPI.id}_${new Date().getTime()}.json`;
    const jsonContent = JSON.stringify(this.xresultado, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonContent);

    if (window.parent && window !== window.parent) {
      window.parent.postMessage(
        {
          type: "OPEN_TXT",
          payload: {
            fileName: filename,
            data: dataUri,
          },
        },
        "*",
      );
      this.utilservice.AlertMini("top-end", "info", "Exportando JSON vía Puente...", 2000);
    } else {
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  copiarEntradasJson(): void {
    const content = this.parsedEntradas
      ? JSON.stringify(this.parsedEntradas, null, 2)
      : "";
    this.copyToClipboard(content);
  }

  copyToClipboard(text?: string): void {
    const content =
      text || (this.xresultado ? JSON.stringify(this.xresultado, null, 2) : "");
    if (!content) {
      this.utilservice.AlertMini("top-end", "warning", "Nada que copiar", 2000);
      return;
    }

    navigator.clipboard
      .writeText(content)
      .then(() => {
        this.utilservice.AlertMini("top-end", "success", "Copiado al portapapeles", 2000);
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
        this.utilservice.AlertMini("top-end", "error", "Error al copiar", 2000);
      });
  }

  getDbIcon(engine: string): string {
    const d = (engine || "").toLowerCase();
    if (d.includes("mariadb")) return "assets/images/icons/db/mariadb.svg";
    if (d.includes("mysql")) return "assets/images/icons/db/mysql.svg";
    if (d.includes("postgres") || d.includes("pgsql"))
      return "assets/images/icons/db/postgres.svg";
    if (d.includes("mongo") || d.includes("mgdba"))
      return "assets/images/icons/db/mongodb.svg";
    if (d.includes("couch")) return "assets/images/icons/db/couchdb.svg";
    if (d.includes("rethink")) return "assets/images/icons/db/rethinkdb.svg";
    if (d.includes("sqlserver") || d.includes("mssql"))
      return "assets/images/icons/db/sqlserver.svg";
    return "assets/images/icons/db/database.svg";
  }

  getDbMatteClass(engine: string): string {
    const d = (engine || "").toLowerCase();
    if (d.includes("mariadb")) return "db-matte-mariadb";
    if (d.includes("mysql")) return "db-matte-mysql";
    if (d.includes("postgres") || d.includes("pgsql"))
      return "db-matte-postgres";
    if (d.includes("mongo") || d.includes("mgdba")) return "db-matte-mongodb";
    if (d.includes("couch")) return "db-matte-couchdb";
    if (d.includes("rethink")) return "db-matte-rethinkdb";
    if (d.includes("sqlserver") || d.includes("mssql"))
      return "db-matte-sqlserver";
    return "db-matte-neutral";
  }
}
