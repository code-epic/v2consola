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
    host: { class: 'ecommerce-application' },
    standalone: false
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
    logs: false,
    traza: false,
    columnas: '',
    prefijo: '',
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

  public codeMirrorOptions: any = {
    lineNumbers: true,
    theme: 'idea',
    mode: 'javascript',
    lineWrapping: true
  };

  public data
  public urlControl = ''
  public driversAPP
  public url = ''

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


  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilservice: UtilService,

  ) { }


  async ngOnInit() {

    this.rutaURL = this.rutaActiva.snapshot.params.id
    this.urlControl = this.rutaActiva.snapshot.params.ruta
    let url = ''

    if (this.urlControl != undefined) {
      let valor = atob(this.urlControl).split('|')
      this.driversAPP = valor[0]
      this.url = valor[1]
      url = '/' + this.url
      // console.log(valor)
    }


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
            link: '/home'
          },
          {
            name: 'Aplicaciones',
            isLink: true,
            link: '/tools/applications'
          },
          {
            name: 'Api',
            isLink: true,
            link: '/tools/applications' + url
          },
          {
            name: 'Detalle',
            isLink: true,
            link: '/tools/applications/api-list/' + this.urlControl
          },
          {
            name: this.rutaURL,
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

        // Parse JSON string if needed
        let entradasData: any = this.xAPI.entradas;
        if (typeof entradasData === 'string') {
          try {
            entradasData = JSON.parse(entradasData);
          } catch (e) {
            // console.error('Error parsing entradas JSON:', e);
            entradasData = { error: 'Invalid JSON format' };
          }
        }

        // Clear previous content
        const container = document.getElementById("xrsx");
        if (container) {
          container.innerHTML = '';
          const formatter = new JSONFormatter(entradasData, 2, { theme: 'dark' });
          container.appendChild(formatter.render());
        }
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
        this.PromoverAPI(funcion, entorno)
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
          this.xresultado = data; // Almacenamos el resultado para exportación
          
          const container = document.getElementById("xrs");
          if (container) {
            container.innerHTML = ''; // Limpiar antes de mostrar nuevo resultado
            const formatter = new JSONFormatter(data);
            container.appendChild(formatter.render());
          }
        } else {
          this.xresultado = null
          this.utilservice.AlertMini('top-end', 'error', 'La API respondio NULL', 3000)
        }
      },
      (error) => {
        this.xresultado = error;
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
    await this.apiService.Guardar(jsonG, sApi).subscribe(
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

  getContent() {

    // const formatter = new JSONFormatter(this.xAPI.entradas);
    // document.getElementById("xrsx").appendChild(formatter.render());
  }


  exportResultadoJSON() {
    if (!this.xresultado) {
      this.utilservice.AlertMini('top-end', 'warning', 'No hay datos para exportar', 3000);
      return;
    }

    const filename = `export_api_${this.xAPI.id}_${new Date().getTime()}.json`;
    const jsonContent = JSON.stringify(this.xresultado, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);

    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_TXT',
        payload: {
          fileName: filename,
          data: dataUri
        }
      }, '*');
      this.utilservice.AlertMini('top-end', 'info', 'Exportando JSON via Puente...', 2000);
    } else {
      // Fallback descarga directa
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  copyToClipboard(text?: string) {
    const content = text || (this.xresultado ? JSON.stringify(this.xresultado, null, 2) : '');
    if (!content) {
      this.utilservice.AlertMini('top-end', 'warning', 'Nada que copiar', 2000);
      return;
    }

    navigator.clipboard.writeText(content).then(() => {
      this.utilservice.AlertMini('top-end', 'success', 'Copiado al portapapeles', 2000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.utilservice.AlertMini('top-end', 'error', 'Error al copiar', 2000);
    });
  }

}
