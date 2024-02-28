import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import JSONFormatter from 'json-formatter-js';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-api-details',
  templateUrl: './api-details.component.html',
  styleUrls: ['./api-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})


export class ApiDetailsComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia: false,
    protocolo: '',
    ruta: '',
    retorna: false,
    migrar: false,
    modulo: '',
    valores: {},
    coleccion: '',
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: '',
    query: '',
    metodo: '',
    tipo: '',
    prioridad: '',
    entorno: '',
    logs: false
  };

  public apiPromover: IAPICore = {
    funcion: '',
    entorno: ''
  }

  // public
  public contentHeader: object;

  public rutaURL

  public xentorno
  resultado: any;
  xresultado: any;
  xparametro: string = ''
  valores: string = ''

  public data


  public UpdateAPI = {}

  public api =
    {
      'funcion': '',
      'estatus': undefined,
      'descripcion': '',
      'version': 0,
      'driver': '',
      'hash': '',
      'entorno': ''
    }

  /**
   * Constructor
   *
   */
  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private modalService: NgbModal,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,

  ) { }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Wishlist
   *
   * @param product
   */
  toggleWishlist(product) {

  }

  /**
   * Add To Cart
   *
   * @param product
   */
  addToCart(product) {

  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {

    this.rutaURL = this.rutaActiva.snapshot.params.id

    await this.ConsultarAPI(this.rutaURL)
    // content header
    this.contentHeader = {
      headerTitle: 'Detalle API REST',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Herramientas',
            isLink: false,
          },
          {
            name: 'API REST',
            isLink: true,
            link: '/tools/api'
          },
          {
            name: 'Details',
            isLink: false
          }
        ]
      }
    };

    
    
  }

  async ConsultarAPI(api: string) {
    this.xAPI.funcion = "_SYS_R_ListarApisID";
    this.xAPI.parametros = api
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        data.map(e => {
          this.xAPI = e
        });
        const formatter = new JSONFormatter(this.xAPI.entradas);
        document.getElementById("xrsx").appendChild(formatter.render());
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ModalProbar(modal, data) {
    var api = data.entorno == "produccion" ? "/v1/" : "/devel/"
    this.xentorno = api + "api/crud:" + data.id;
    this.data = data
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async promover(entorno: string, funcion: string) {
    await Swal.fire({
      title: 'Esta Seguro de Promover API?',
      html: `<font color="red"><strong>${funcion}</strong></font> <br> a Entorno de <strong>${entorno.toUpperCase()}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Promover!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.PromoverAPI(funcion,entorno)
      }
    })
  }


  async ejecutarApi() {
    this.xAPI = this.data;
    this.xAPI.parametros = this.xparametro
    this.xAPI.valores = this.valores
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data !== null) {
          this.utilservice.AlertMini('top-end', 'success', 'Consulta Exitosa!', 3000)
          const formatter = new JSONFormatter(data);
          document.getElementById("xrs").appendChild(formatter.render());
        } else {
          this.resultado = null
          this.utilservice.AlertMini('top-end', 'error', 'La API respondio NULL', 3000)
        }
      },
      (error) => {
        this.resultado = error;
      }
    )
  }

  async PromoverAPI(funcion: string, entorno: string) {
    this.apiPromover.entorno = entorno
    this.apiPromover.funcion = funcion
    let jsonG = {
      "coleccion": "apicore",
      "relacional": false,
      "tipo": 'INSERTAR',
      "entorno": entorno,
      "valores": this.apiPromover
    };
    let sApi = 'crud';
    this.xAPI = {}
   await  this.apiService.Guardar(jsonG, sApi).subscribe(
      (data) => {
        this.ConsultarAPI(this.rutaURL)
        let id = data.UpsertedID != null ? "registrada codigo: " + data.UpsertedID : "actualizada "
        this.utilservice.AlertMini('top-end', 'success', `Tu (API) ha sido  ${id}`, 3000)
      },
      (errot) => {
        this.utilservice.AlertMini('top-end', 'error', 'Fallo la conexión, con el API', 3000)
      }
    )
  }

  getContent(){

    // const formatter = new JSONFormatter(this.xAPI.entradas);
    // document.getElementById("xrsx").appendChild(formatter.render());
  }



}
