import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";

@Component({
  selector: "app-applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
  encapsulation: ViewEncapsulation.None,
  host: { class: "ecommerce-application" },
})
export class ApplicationsComponent implements OnInit {
  searchType: string = "conexiones"; // Valor inicial del select
  searchText: string = ''; // Para el input de búsqueda normal
  selectCustomSelected = []; // Para el ng-select

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
    private apiService: ApiService
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }


  async ngOnInit() {
    // this.CargarDrivers()
    await this.ListarApis();
    await this.CargarListaAplicaciones();

    this.contentHeader = {
      headerTitle: 'Herramientas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
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

  async ListarApis() {
    this.developer = [];
    this.xAPI.funcion = "_SYS_R_ListarTodasApis";
    this.xAPI.parametros = '';
    this.xAPI.valores = '';
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        if (data == null) return;

        await data.map((e) => {
          e.descripcion = e.descripcion == undefined ? '' : e.descripcion;
          this.selectCustomSelected.push(e);
        });
        this.rowData = this.selectCustomSelected;
        this.tempData = this.rowData;
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

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = '';
    this.ListaAplicaciones = [];
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map((e) => {
          this.ListaAplicaciones.push(e);
        });
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
