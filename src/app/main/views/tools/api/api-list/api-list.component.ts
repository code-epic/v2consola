import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  signal,
  ChangeDetectorRef,
} from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { NgbModalConfig, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";

@Component({
  selector: "app-api-list",
  templateUrl: "./api-list.component.html",
  styleUrls: ["./api-list.component.scss"],
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
export class ApiListComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();

  public contentHeader: object;
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public searchTextCtrl = new FormControl("");
  get searchText(): string {
    return this.searchTextCtrl.value || "";
  }

  public selectedEngineCtrl = new FormControl<string | null>(null);
  public selectCustomSelectedCtrl = new FormControl<any>(null);
  public selectedStatusFilter: "all" | "activos" | "inactivos" = "all";

  public page = 1;
  public pageSize = 8;

  private _drivers = signal<any[]>([]);
  get drivers(): any[] {
    return this._drivers();
  }

  public filteredDrivers: any[] = [];

  private _rowData = signal<any[]>([]);
  get rowData(): any[] {
    return this._rowData();
  }

  public isLoadingDrivers: boolean = false;
  public isLoadingApis: boolean = false;

  public id: string = "";
  public count: number = 0;
  public tempData: any[] = [];
  public urlControl = "";
  public driversAPP: any;
  public url = "";

  public dbEnginesFilter: any[] = [
    { id: "postgres", descripcion: "PostgreSQL", icon: "assets/images/icons/db/postgres.svg", matteClass: "db-matte-postgres" },
    { id: "mysql", descripcion: "MySQL", icon: "assets/images/icons/db/mysql.svg", matteClass: "db-matte-mysql" },
    { id: "mariadb", descripcion: "MariaDB", icon: "assets/images/icons/db/mariadb.svg", matteClass: "db-matte-mariadb" },
    { id: "mongo", descripcion: "MongoDB", icon: "assets/images/icons/db/mongodb.svg", matteClass: "db-matte-mongodb" },
    { id: "couch", descripcion: "CouchDB", icon: "assets/images/icons/db/couchdb.svg", matteClass: "db-matte-couchdb" },
    { id: "rethink", descripcion: "RethinkDB", icon: "assets/images/icons/db/rethinkdb.svg", matteClass: "db-matte-rethinkdb" },
    { id: "sqlserver", descripcion: "SQL Server", icon: "assets/images/icons/db/sqlserver.svg", matteClass: "db-matte-sqlserver" },
    { id: "oracle", descripcion: "Oracle", icon: "assets/images/icons/db/database.svg", matteClass: "db-matte-neutral" },
  ];

  constructor(
    private ruta: Router,
    private rutaActiva: ActivatedRoute,
    private config: NgbModalConfig,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.rutaActiva.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this.id = params["id"] || "";
        this.urlControl = params["ruta"];
        this.initView();
      });

    this.searchTextCtrl.valueChanges
      .pipe(debounceTime(120), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.applyDriverFilters();
      });

    this.selectedEngineCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.page = 1;
        this.applyDriverFilters();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private initView(): void {
    let url = "";
    if (this.urlControl != undefined) {
      try {
        const valor = atob(this.urlControl).split("|");
        this.driversAPP = valor[0];
        this.url = valor[1];
        url = "/" + this.id + "/" + this.url;
      } catch (e) {
        url = "";
      }
    }

    this.CargarDrivers();
    this.ListarApis();

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
            isLink: true,
            link: "/tools/applications" + url,
          },
          {
            name: this.id || "Drivers & API",
            isLink: false,
          },
        ],
      },
    };
  }

  get totalDrivers(): number {
    return (this.drivers || []).length;
  }

  get totalActivos(): number {
    return (this.drivers || []).filter((d) => this.isDriverActive(d)).length;
  }

  get totalInactivos(): number {
    return (this.drivers || []).filter((d) => !this.isDriverActive(d)).length;
  }

  get pagedDrivers(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredDrivers.slice(start, start + this.pageSize);
  }

  isDriverActive(drv: any): boolean {
    if (!drv) return false;
    const st = drv.estatus ?? drv.status;
    return st === true || st === 1 || st === "1" || st === "true";
  }

  setStatusFilter(status: "all" | "activos" | "inactivos"): void {
    this.selectedStatusFilter = status;
    this.page = 1;
    this.applyDriverFilters();
  }

  clearFilters(): void {
    this.searchTextCtrl.setValue("", { emitEvent: false });
    this.selectedEngineCtrl.setValue(null, { emitEvent: false });
    this.selectedStatusFilter = "all";
    this.page = 1;
    this.applyDriverFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      (this.searchText && this.searchText.trim()) ||
      this.selectedEngineCtrl.value ||
      this.selectedStatusFilter !== "all"
    );
  }

  applyDriverFilters(): void {
    const q = (this.searchText || "").toLowerCase().trim();
    const eng = (this.selectedEngineCtrl.value || "").toLowerCase().trim();
    const status = this.selectedStatusFilter;

    this.filteredDrivers = (this.drivers || []).filter((drv) => {
      if (status === "activos" && !this.isDriverActive(drv)) return false;
      if (status === "inactivos" && this.isDriverActive(drv)) return false;

      if (eng) {
        const dType = (drv.driver || "").toLowerCase();
        if (!dType.includes(eng)) return false;
      }

      if (q) {
        const desc = (drv.descripcion || "").toLowerCase();
        const bd = (drv.basedatos || "").toLowerCase();
        const dType = (drv.driver || "").toLowerCase();
        const id = (drv.id || "").toLowerCase();
        const host = (drv.host || "").toLowerCase();
        const port = String(drv.puerto || "").toLowerCase();
        return (
          desc.includes(q) ||
          bd.includes(q) ||
          dType.includes(q) ||
          id.includes(q) ||
          host.includes(q) ||
          port.includes(q)
        );
      }

      return true;
    });

    this.cdr.detectChanges();
  }

  ListarApis(): void {
    this.isLoadingApis = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_R_ListarApisAPP";
    this.xAPI.parametros = this.id;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.isLoadingApis = false;
        if (!Array.isArray(data) || (data as any).msj != undefined) {
          this._rowData.set([]);
          this.count = 0;
          this.tempData = [];
          this.cdr.detectChanges();
          return;
        }
        const normalized = data.map((e: any) => ({
          ...e,
          descripcion: e.descripcion ?? "",
          aplicacion: e.aplicacion || this.id,
          searchKey: `${e.funcion || ""} ${e.descripcion || ""} ${e.driver || ""} ${e.tipo || ""} ${e.coleccion || ""}`.toLowerCase(),
        }));
        this._rowData.set(normalized);
        this.count = normalized.length;
        this.tempData = normalized;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingApis = false;
        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  customApiSearchFn = (term: string, item: any): boolean => {
    if (!term) return true;
    const clean = term.toLowerCase().trim();
    if (item.searchKey) return item.searchKey.includes(clean);
    return (
      (item.funcion || "").toLowerCase().includes(clean) ||
      (item.descripcion || "").toLowerCase().includes(clean) ||
      (item.driver || "").toLowerCase().includes(clean)
    );
  };

  onSelectChange(e: any): void {
    if (!e) return;
    const item =
      typeof e === "object"
        ? e
        : this.rowData.find((r) => r.id === e || r.funcion === e);
    if (!item || !item.funcion) return;

    const url = btoa(`${item.driver || "MGDBA"}|${item.aplicacion || this.id}`);
    const surl = `tools/applications/api-details/${item.funcion}/${url}`;
    this.ruta.navigate([surl]);
  }

  irA(base: string, ruta: string): void {
    this.ruta.navigate([base, ruta]);
  }

  CargarDrivers(): void {
    const MGDBA = {
      _id: "60aab142a0f72cf87ed7a056",
      aplicacion: "consola",
      basedatos: "code_epic",
      descripcion: "Sandra Server Core 1.0.0",
      driver: "mongodb",
      estatus: true,
      host: "sandra.epic",
      id: "MGDBA",
      protocolo: null,
      puerto: "27017",
      url: "",
      usuario: "",
    };

    this.isLoadingDrivers = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_R_ListarDriver";
    this.xAPI.parametros = this.id;
    this._drivers.set([]);
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.isLoadingDrivers = false;
        const list = Array.isArray(data) ? [...data] : [];
        if (this.id === "consola") {
          list.push(MGDBA);
        }
        this._drivers.set(list);
        this.applyDriverFilters();
      },
      error: (error) => {
        this.isLoadingDrivers = false;
        console.log(error);
        this.applyDriverFilters();
      },
    });
  }

  recargar(): void {
    this.CargarDrivers();
    this.ListarApis();
  }

  getUrl(id: string): string {
    return btoa(`${id}|${this.id}`);
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
