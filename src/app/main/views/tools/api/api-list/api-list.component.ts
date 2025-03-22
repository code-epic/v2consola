import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ComunicationsService } from '@services/networks/comunications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WsocketsService } from '@services/websockets/wsockets.service';

import { AES } from 'crypto-js';
const clave = '5412892DF0D2919B04ADD29EDEFABA30E30F6D7F5A62A9B84AD46BDE23B25491';
import { enc } from 'crypto-js';

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
  public pageSize = 12;
  public pageBasic = 1;

  public drivers = []


  public selectCustomSelected = [];
  


  public id : string = ''


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




  async  ngOnInit() {
    
    this.id = this.rutaActiva.snapshot.params.id
    this.urlControl = this.rutaActiva.snapshot.params.ruta
    
    let url = ''

    if (this.urlControl != undefined){
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
            link: '/tools/applications'+url
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
    this.xAPI.funcion = '_SYS_R_ListarApisAPP'
    this.xAPI.parametros =  this.id
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


   async CargarDrivers(){
    this.xAPI.funcion = '_SYS_R_ListarDriver'
    this.xAPI.parametros = this.id
    this.drivers = []
   await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        // console.log(data)
        this.drivers = await data
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  getUrl(id: string): string{
    // console.log(id, this.id)
    let url = id + '|' + this.id
    return btoa(url)
  }


}
