import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-api-list',
  templateUrl: './api-list.component.html',
  styleUrls: ['./api-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class ApiListComponent implements OnInit {

  public contentHeader: object;

  closeResult: string = ''

  codeTypeJs = ''


  xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  };

  public searchText: string = '';
  public page = 1;
  public pageSize = 8;
  public pageBasic = 1;

  public drivers = []


  public selectCustomSelected = [];



  public id: string = ''


  public rowData = []
  public developer = []
  public count
  public tempData = []
  public hashcontrol: string

  public urlControl = ''
  public driversAPP
  public url = ''

  constructor(
    private ruta: Router,
    private rutaActiva: ActivatedRoute,
    private config: NgbModalConfig,
    private apiService: ApiService,
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }




  async ngOnInit() {

    this.id = this.rutaActiva.snapshot.params.id
    this.urlControl = this.rutaActiva.snapshot.params.ruta

    let url = ''

    if (this.urlControl != undefined) {
      let valor = atob(this.urlControl).split('|')
      this.driversAPP = valor[0]
      this.url = valor[1]
      url = '/' + this.id + '/' + this.url
    }



    await this.ListarApis()
    await this.CargarDrivers()
    this.contentHeader = {
      headerTitle: 'Herramientas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/home'
          },
          {
            name: 'Aplicaciones',
            isLink: true,
            link: '/tools/applications' + url
          },
          {
            name: 'Api',
            isLink: false
          }
        ]
      }
    };

  }

  async ListarApis() {

    this.developer = []
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = '_SYS_R_ListarApisAPP'
    this.xAPI.parametros = this.id
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        if (data.msj != undefined) return
        await data.map(e => {
          e.descripcion = e.descripcion == undefined ? '' : e.descripcion
          this.selectCustomSelected.push(e)
        })
        this.rowData = this.selectCustomSelected;
        this.count = this.rowData.length
        this.tempData = this.rowData;
      },
      (error) => {
        console.error(error)
      }
    );
  }

  onSelectChange(event) {
    const url = "tools/api-details/" + event.funcion
    this.ruta.navigate([url]);
  }


  irA(base: string, ruta: string) {
    this.ruta.navigate([base, ruta])
  }


  async CargarDrivers() {

    let MGDBA = {
      "_id": "60aab142a0f72cf87ed7a056",
      "aplicacion": "consola",
      "basedatos": "code_epic",
      "descripcion": "Sandra Server Core 1.0.0",
      "driver": "mongodb",
      "estatus": true,
      "host": "sandra.epic",
      "id": "MGDBA",
      "protocolo": null,
      "puerto": "27017",
      "url": "",
      "usuario": ""
    }


    this.xAPI = {} as IAPICore
    this.xAPI.funcion = '_SYS_R_ListarDriver'
    this.xAPI.parametros = this.id
    this.drivers = []
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.drivers = data
        if (this.id == 'consola')
          this.drivers.push(MGDBA)

      },
      (error) => {
        console.log(error)
      }
    )
  }

  getUrl(id: string): string {
    // console.log(id, this.id)
    let url = id + '|' + this.id
    return btoa(url)
  }


}
