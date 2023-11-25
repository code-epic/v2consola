import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ComunicationsService } from '@services/networks/comunications.service';
import { Router } from '@angular/router';
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
    parametros: '',
    valores: ''
  };
  
  public searchText: string = '';
  public page = 1;
  public pageSize = 12;
  public pageBasic = 1;

  public drivers = []

  constructor(
    private msjService: WsocketsService,
    private ruta: Router,
    private comunicacionesService : ComunicationsService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private apiService: ApiService,
  ) {
    config.backdrop = false;
    config.keyboard = false;
  }


  codeMOEsquemaJson: any = {
    theme: 'idea',
    mode: 'application/ld+json',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true,
    autofocus: true
  };

  codeJson: any = {
    theme: 'idea',
    mode: 'text/typescript',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true
  };



   ngOnInit() {
    this.CargarDrivers()
  

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
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'Api Rest',
            isLink: false
          }
        ]
      }
    };

  }


  irA(base: string, ruta: string) {
    this.ruta.navigate([base, ruta])
  }


   CargarDrivers(){
    this.xAPI.funcion = '_SYS_R_ListarDriver'
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.drivers = []
     this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map(e => {
          e.ruta = e.id
          this.drivers.push(e)
        });
      },
      (error) => {
        console.log(error)
      }
    ) 
  }


}
