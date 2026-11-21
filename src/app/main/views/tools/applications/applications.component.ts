import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
} from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { NgbModalConfig, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";

@Component({
  selector: "app-applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
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
    ContentHeaderComponent,
  ],
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();

  public searchTypeCtrl = new FormControl("conexiones");
  get searchType(): string {
    return this.searchTypeCtrl.value || "conexiones";
  }

  public searchTextCtrl = new FormControl("");
  get searchText(): string {
    return this.searchTextCtrl.value || "";
  }

  public selectedDbCtrl = new FormControl<string | null>(null);
  public selectedLangCtrl = new FormControl<string | null>(null);
  public selectCustomSelectedCtrl = new FormControl<any>(null);
  public pageSizeCtrl = new FormControl<number>(8);

  public selectedStatusFilter: "all" | "activas" | "inactivas" = "all";

  public contentHeader: object;
  public ListaAplicaciones: any[] = [];
  public filteredAplicaciones: any[] = [];

  public isLoadingApps: boolean = false;
  public isLoadingApis: boolean = false;
  public apisLoaded: boolean = false;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: "",
  };

  public page = 1;
  get pageSize(): number {
    return Number(this.pageSizeCtrl.value) || 8;
  }

  public drivers: any[] = [];
  public developer: any[] = [];
  public rowData: any[] = [];
  public tempData: any[] = [];

  public dbEnginesFilter: any[] = [
    { id: "POSTGRES", descripcion: "PostgreSQL", icon: "assets/images/icons/db/postgres.svg", matteClass: "db-matte-postgres" },
    { id: "MYSQL", descripcion: "MySQL", icon: "assets/images/icons/db/mysql.svg", matteClass: "db-matte-mysql" },
    { id: "MARIADB", descripcion: "MariaDB", icon: "assets/images/icons/db/mariadb.svg", matteClass: "db-matte-mariadb" },
    { id: "MONGODB", descripcion: "MongoDB", icon: "assets/images/icons/db/mongodb.svg", matteClass: "db-matte-mongodb" },
    { id: "COUCHDB", descripcion: "CouchDB", icon: "assets/images/icons/db/couchdb.svg", matteClass: "db-matte-couchdb" },
    { id: "RETHINKDB", descripcion: "RethinkDB", icon: "assets/images/icons/db/rethinkdb.svg", matteClass: "db-matte-rethinkdb" },
    { id: "SQLSERVER", descripcion: "SQL Server", icon: "assets/images/icons/db/sqlserver.svg", matteClass: "db-matte-sqlserver" },
    { id: "ORACLE", descripcion: "Oracle", icon: "assets/images/icons/db/database.svg", matteClass: "db-matte-neutral" },
  ];

  public languageFilters: { id: string; descripcion: string }[] = [];

  constructor(
    private ruta: Router,
    config: NgbModalConfig,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.CargarListaAplicaciones();

    this.searchTextCtrl.valueChanges
      .pipe(debounceTime(120), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.applyFilters();
      });

    this.selectedDbCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.applyFilters();
      });

    this.selectedLangCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.applyFilters();
      });

    this.pageSizeCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.cdr.detectChanges();
      });

    this.searchTypeCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((mode) => {
        if (mode === "api") {
          this.ensureApisLoaded();
        }
        this.cdr.detectChanges();
      });

    this.contentHeader = {
      headerTitle: "Herramientas",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Principal",
            isLink: true,
            link: "/home",
          },
          {
            name: "Aplicaciones",
            isLink: false,
          },
        ],
      },
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  get totalAplicaciones(): number {
    return this.ListaAplicaciones.length;
  }

  get totalActivas(): number {
    return this.ListaAplicaciones.filter((a) => this.isAppActive(a)).length;
  }

  get totalInactivas(): number {
    return this.ListaAplicaciones.filter((a) => !this.isAppActive(a)).length;
  }

  get pagedAplicaciones(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAplicaciones.slice(start, start + this.pageSize);
  }

  isAppActive(app: any): boolean {
    if (!app) return false;
    const st = app.status ?? app.estatus;
    return st === "1" || st === 1 || st === true || st === "true";
  }

  setSearchMode(mode: "conexiones" | "api"): void {
    this.searchTypeCtrl.setValue(mode);
  }

  setStatusFilter(status: "all" | "activas" | "inactivas"): void {
    this.selectedStatusFilter = status;
    this.page = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTextCtrl.setValue("", { emitEvent: false });
    this.selectedDbCtrl.setValue(null, { emitEvent: false });
    this.selectedLangCtrl.setValue(null, { emitEvent: false });
    this.selectedStatusFilter = "all";
    this.page = 1;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      (this.searchText && this.searchText.trim()) ||
      this.selectedDbCtrl.value ||
      this.selectedLangCtrl.value ||
      this.selectedStatusFilter !== "all"
    );
  }

  applyFilters(): void {
    const q = (this.searchText || "").toLowerCase().trim();
    const dbFilter = (this.selectedDbCtrl.value || "").toLowerCase().trim();
    const langFilter = (this.selectedLangCtrl.value || "").toLowerCase().trim();
    const status = this.selectedStatusFilter;

    this.filteredAplicaciones = (this.ListaAplicaciones || []).filter((app) => {
      if (status === "activas" && !this.isAppActive(app)) return false;
      if (status === "inactivas" && this.isAppActive(app)) return false;

      if (dbFilter) {
        const appDb = (app.basedatos || "").toLowerCase();
        if (!appDb.includes(dbFilter)) return false;
      }

      if (langFilter) {
        const appLang = (app.lenguaje || "").toLowerCase();
        if (appLang !== langFilter) return false;
      }

      if (q) {
        const nombre = (app.nombre || "").toLowerCase();
        const proyecto = (app.proyecto || "").toLowerCase();
        const bd = (app.basedatos || "").toLowerCase();
        const rama = (app.rama || "").toLowerCase();
        const lenguaje = (app.lenguaje || "").toLowerCase();
        const origen = (app.origen || "").toLowerCase();
        return (
          nombre.includes(q) ||
          proyecto.includes(q) ||
          bd.includes(q) ||
          rama.includes(q) ||
          lenguaje.includes(q) ||
          origen.includes(q)
        );
      }

      return true;
    });

    this.cdr.detectChanges();
  }

  /**
   * Carga lazy del catálogo global de APIs solo cuando el usuario utiliza el buscador por API
   */
  ensureApisLoaded(force: boolean = false): void {
    if ((this.apisLoaded && !force) || this.isLoadingApis) {
      return;
    }
    this.ListarApis();
  }

  ListarApis(): void {
    this.isLoadingApis = true;
    this.developer = [];
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_R_ListarTodasApis";
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data: any[]) => {
        this.isLoadingApis = false;
        this.apisLoaded = true;
        if (!Array.isArray(data)) {
          this.rowData = [];
          this.cdr.detectChanges();
          return;
        }

        this.rowData = data.map((e) => ({
          ...e,
          descripcion: e.descripcion ?? "",
          searchKey: `${e.funcion || ""} ${e.descripcion || ""} ${e.aplicacion || ""} ${e.driver || ""} ${e.tipo || ""} ${e.coleccion || ""}`.toLowerCase(),
        }));
        this.tempData = this.rowData;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingApis = false;
        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Función de búsqueda rápida multicampo para el autocomplete de APIs
   */
  customApiSearchFn = (term: string, item: any): boolean => {
    if (!term) return true;
    const cleanTerm = term.toLowerCase().trim();
    if (item.searchKey) {
      return item.searchKey.includes(cleanTerm);
    }
    const fn = (item.funcion || "").toLowerCase();
    const desc = (item.descripcion || "").toLowerCase();
    const app = (item.aplicacion || "").toLowerCase();
    const drv = (item.driver || "").toLowerCase();
    return (
      fn.includes(cleanTerm) ||
      desc.includes(cleanTerm) ||
      app.includes(cleanTerm) ||
      drv.includes(cleanTerm)
    );
  };

  LinkRuta(e: any): void {
    if (!e) return;
    const item =
      typeof e === "object"
        ? e
        : this.rowData.find((r) => r.id === e || r.funcion === e);
    if (!item || !item.funcion) return;

    const url = btoa(`${item.driver || "MGDBA"}|${item.aplicacion || ""}`);
    const surl = `tools/applications/api-details/${item.funcion}/${url}`;
    this.ruta.navigate([surl]);
  }

  CargarListaAplicaciones(): void {
    this.isLoadingApps = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = "";
    this.ListaAplicaciones = [];
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.isLoadingApps = false;
        const raw = Array.isArray(data?.Cuerpo)
          ? [...data.Cuerpo]
          : Array.isArray(data)
            ? [...data]
            : [];
        this.ListaAplicaciones = raw.filter((a: any) => {
          const nombre = (a?.nombre || "").toLowerCase().trim();
          const proyecto = (a?.proyecto || "").toLowerCase().trim();
          const aplicacion = (a?.aplicacion || "").toLowerCase().trim();
          return (
            nombre !== "consola" &&
            proyecto !== "consola" &&
            aplicacion !== "consola"
          );
        });

        // Extraer lenguajes únicos dinámicamente
        const langs = Array.from(
          new Set(
            this.ListaAplicaciones.map((a) =>
              (a.lenguaje || "").toString().trim().toUpperCase(),
            ).filter(Boolean),
          ),
        ).sort();
        this.languageFilters = langs.map((l) => ({ id: l, descripcion: l }));

        this.applyFilters();
      },
      error: (error) => {
        this.isLoadingApps = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  recargar(): void {
    this.CargarListaAplicaciones();
    if (this.searchType === "api" || this.apisLoaded) {
      this.ensureApisLoaded(true);
    }
  }

  irA(base: string, ruta: string): void {
    this.ruta.navigate([base, ruta]);
  }

  getDbIcon(engine: string): string {
    const d = (engine || "").toLowerCase();
    if (d.includes("mariadb")) return "assets/images/icons/db/mariadb.svg";
    if (d.includes("mysql")) return "assets/images/icons/db/mysql.svg";
    if (d.includes("postgres") || d.includes("pgsql"))
      return "assets/images/icons/db/postgres.svg";
    if (d.includes("mongo")) return "assets/images/icons/db/mongodb.svg";
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
    if (d.includes("mongo")) return "db-matte-mongodb";
    if (d.includes("couch")) return "db-matte-couchdb";
    if (d.includes("rethink")) return "db-matte-rethinkdb";
    if (d.includes("sqlserver") || d.includes("mssql"))
      return "db-matte-sqlserver";
    return "db-matte-neutral";
  }
}
