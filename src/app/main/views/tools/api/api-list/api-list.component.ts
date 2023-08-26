import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ComunicationsService } from '@services/networks/comunications.service';
import { Router } from '@angular/router';
import { WsocketsService } from '@services/websockets/wsockets.service';

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
        this.drivers = data
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  


}