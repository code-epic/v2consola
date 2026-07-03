import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";

import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
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
        ReactiveFormsModule,
        RouterModule,
        CoreDirectivesModule,
        CorePipesModule,
        NgbModule,
        NgSelectModule,
        ContentHeaderComponent,
    ]
})
export class ApplicationsComponent implements OnInit {
  searchTypeCtrl = new FormControl("conexiones");
  get searchType() { return this.searchTypeCtrl.value; }
  searchTextCtrl = new FormControl('');
  get searchText() { return this.searchTextCtrl.value; }
  selectCustomSelectedCtrl = new FormControl(null);
  get selectCustomSelected() { return this.selectCustomSelectedCtrl.value; }

  public contentHeader: object;
  closeResult: string = '';
  codeTypeJs = '';
  public ListaAplicaciones = [];

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: '',
  };

  public page = 1;
  public pageSize = 8;
  public pageBasic = 1;

  public drivers = [];
  public developer = [];
  public rowData = [];
  public tempData = [];

  constructor(
    private ruta: Router,
    config: NgbModalConfig,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }


  ngOnInit() {
    // this.CargarDrivers()
    this.ListarApis();
    this.CargarListaAplicaciones();

    this.contentHeader = {
      headerTitle: 'Herramientas',
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
            name: 'Aplicaciones',
            isLink: false,
          },
        ],
      },
    };
  }


  onSelectChange(event: any) {
    // console.log('Selección cambiada:', event)
  }

  ListarApis() {
    this.developer = [];
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_R_ListarTodasApis";
    this.xAPI.parametros = '';
    this.xAPI.valores = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any[]) => {
        if (data == null) return;

        this.rowData = data.map((e) => {
          e.descripcion = e.descripcion == undefined ? '' : e.descripcion;
          return e;
        });
        this.tempData = this.rowData;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
      }
    )
  }


  LinkRuta(e) {
    let url = btoa(e.driver + "|" + e.aplicacion);
    let surl = "tools/applications/api-details/" + e.funcion + "/" + url;
    this.ruta.navigate([surl]);
  }

  CargarListaAplicaciones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = '';
    this.ListaAplicaciones = [];
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaAplicaciones = data.Cuerpo ? [...data.Cuerpo] : [];
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  irA(base: string, ruta: string) {
    this.ruta.navigate([base, ruta]);
  }

  CargarDrivers() {
    this.xAPI.funcion = "_SYS_R_ListarDriver";
    this.xAPI.parametros = '';
    this.xAPI.valores = '';
    this.drivers = [];
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map((e) => {
          e.ruta = e.id;
          this.drivers.push(e);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

}
