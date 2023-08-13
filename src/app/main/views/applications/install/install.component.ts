import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig,NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' },providers: [NgbModalConfig, NgbModal]
})
export class InstallComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  public tiposs = [
    {id:'1', descripcion: 'PRE-INSTALADA'},
    {id:'2', descripcion: 'INSTALAR'},
    {id:'3', descripcion: 'REPOSITORIO'},
  ]

  public contentHeader: object;
  public developer = []
  public quality = []
  public production = []

  public shopSidebarToggle = false;
  public shopSidebarReset = false;
  public gridViewRef = false;
  public products;
  public wishlist;
  public cartList;
  public page = 1;
  public pageSize = 9;
  public searchText = '';
  private horizontalWizardStepper: Stepper;
  closeResult: string = ''

  codeTypeJs = ''
  data: any;
  xentorno: string = ''
  resultado: any;
  xresultado: any;
  xparametro: string = ''
  valores: string = ''



  xAPI: IAPICore;

  constructor(
    private apiService : ApiService,
    private modalService: NgbModal,
    private ws : WsocketsService,
    private config: NgSelectConfig,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,

  ) {
    this.config.notFoundText = 'Custom not found';
      this.config.appendTo = 'body';
      this.config.bindValue = 'value';
  }

      
    /**
   * Update to List View
   */
     listView() {
      this.gridViewRef = false;
    }
  
    /**
     * Update to Grid View
     */
    gridView() {
      this.gridViewRef = true;
    }

      /**
   * Sort Product
   */
  sortProduct(sortParam) {
    // this._ecommerceService.sortProduct(sortParam);
    console.info(sortParam);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'backdrop';
    } else {
      return `with: ${reason}`;
    }
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

  clickRefresh(e) {
    this.codeJson = {
      theme: 'idea',
      mode: 'text/typescript',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true
    }
  }

  /* activarFormulario(content, item) {
    console.log(item);
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      scrollable: true
    }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      var api = item.entorno == "produccion" ? "/v1/" : "/devel/"
    this.xentorno = api + "api/crud:" + item.id;
    this.data = item
    if (item.entradas != undefined) {
      this.codeTypeJs = this.apiService.GenerarCodigo(item.entradas, item.funcion, this.xentorno)
      this.clickRefresh(0)
    }
  }


  RegistrarAPI(content) {
    console.log(content);
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      scrollable: true
    }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }


  async ListarApis() {
    this.developer = []
    this.quality = []
    this.production = []
    await this.apiService.Listar().subscribe(
      (data) => {
        data.forEach(e => {
          switch (e.entorno) {
            case "desarrollo":
              this.developer.push(e)
              break;
              case "calidad":
                this.quality.push(e)
                break;
                case "produccion":
                  this.production.push(e)
                  break;
                  default:
                    break;
                  }
                });
                
      },
      (error) => {
        console.error(error)
      }
    );
  }

  async ejecutarApi() {

    this.xAPI = this.data;
    this.xAPI.parametros = this.xparametro
    this.xAPI.valores = this.valores
    console.log(this.xAPI);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        const formatter = new JSONFormatter(data);
        document.getElementById("xrs").appendChild(formatter.render());
      },
      (error) => {
        this.resultado = error;
      }
    )
  } */

  ngOnInit(): void {
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});
   /*  this.ListarApis()
    this.products = this.developer;

    this.contentHeader = {
      headerTitle: 'Herramientas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'APIRESTFULL',
            isLink: true,
            link: '/'
          },
          {
            name: 'Lista de APIS',
            isLink: false
          }
        ]
      }
    } */
  }
  }
