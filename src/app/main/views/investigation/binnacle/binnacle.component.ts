import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-binnacle',
  templateUrl: './binnacle.component.html',
  styleUrls: ['./binnacle.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: "ecommerce-application" },
})
export class BinnacleComponent implements OnInit {

  searchType: string = "conexiones"; // Valor inicial del select
  searchText: string = ''; // Para el input de búsqueda normal
  selectCustomSelected = []; // Para el ng-select

  public contentHeader: object;

  public ListarBitacora = [];

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: '',
  };

  public page = 1;
  public pageSize = 8;
  public pageBasic = 1;

  public developer = [];
  public rowData = [];
  public tempData = [];

  constructor(
    private ruta: Router,
    private apiService: ApiService
  ) {}


  async ngOnInit() {

    await this.CargarBitacora()

    this.contentHeader = {
      headerTitle: 'Investigación',
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

  deleteItem(event: any, data: any) {
    console.log(data);
  }

  async CargarBitacora() {
    this.xAPI.funcion = "_SYS_CBitacoraGrupo";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        if (data == null) return;
        await data.map((e) => {
          this.ListarBitacora.push(e);
        });
        this.rowData = this.ListarBitacora;
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    )
  }

}
