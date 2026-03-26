import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { Router } from "@angular/router";
import { environment } from "environments/environment";

@Component({
  selector: 'app-binnacle',
  templateUrl: './binnacle.component.html',
  styleUrls: ['./binnacle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: "ecommerce-application" },
})
export class BinnacleComponent implements OnInit {

  // Control de vista
  public isListView = false; 

  // Modal / JSON de estructura
  public jsonEstructura = {
    "Usuario": "Userid (NM / CT) del Usuario autenticado en la Aplicación.",
    "Usuario SO": "Userid (NM / CT) del Usuario autenticado en el S.O.",
    "Fecha": "Fecha en que se graba el registro. Formato AAAAMMDD.",
    "Hora": "Hora en que se graba el registro. Formato Militar HH:MM:SS.",
    "IP": "Número de dirección IP del computador donde se realizó la acción.",
    "MAC": "Dirección física de la tarjeta de Red desde la cual se registra la acción.",
    "Computer Name": "Nombre del Computador a nivel de Windows donde se realizó la transacción.",
    "Tipo Actividad": "Login, Consulta, Incluir, Modificar, Eliminar.",
    "Resultado": "0 (Exitoso) o 1 (Fallido).",
    "Resultado Host": "Código que devuelve la transacción.",
    "Porción Libre": "Área para información adicional (Ej: Motivo de login fallido)."
  };

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
  ) { }


  async ngOnInit() {

    await this.CargarBitacora()

    this.contentHeader = {
      headerTitle: 'Investigación',
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
            name: "Auditoria",
            isLink: false,
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

  getMaterialIcon(nombre: string): string {
    const icons = [
      'apps', 'dashboard', 'terminal', 'memory', 'database',
      'developer_board', 'cloud', 'security', 'dns', 'bug_report',
      'api', 'integration_instructions', 'web', 'code', 'build'
    ];
    if (!nombre) return icons[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % icons.length;
    return icons[index];
  }

  async CargarBitacora() {
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_LOGS;
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any[]) => {
        if (!data) return;
        this.ListarBitacora = data;
        this.rowData = this.ListarBitacora;
        this.tempData = this.rowData;
      },
      (error) => {
        console.error(error);
      }
    )
  }

  // ==========================================
  // Exportación y Gestión Global
  // ==========================================

  ImprimirReporteLog() {
    if (this.ListarBitacora.length === 0) return;

    // Generar Cabecera CSV
    let csvContent = "Usuario,Usuario_SO,Fecha,Hora,IP,MAC,Computer_Name,Tipo_Actividad,Resultado,Resultado_Host,Porcion_Libre\n";

    // Recorrer los datos de la bitácora actual para llenar el CSV
    this.ListarBitacora.forEach(item => {
      // Como BinnacleComponent muestra 'aplicaciones' para entrar luego a la traza, 
      // si el usuario quiere el CSV global, generaremos un pseudo-registro por aplicación 
      // o usaremos los datos disponibles a nivel app.
      // Ajusta esto a los datos reales si 'ListarBitacora' tiene eventos globales.
      const usuario = item.autor || 'N/A';
      const userSo = 'N/A';
      const fecha = this.formatDate(new Date()); 
      const hora = this.formatTime(new Date());
      const ip = item.ip || '127.0.0.1';
      const mac = item.mac || '00:00:00:00:00:00';
      const compName = 'N/A';
      const tipo = 'Consulta'; // Por defecto estado base
      const result = '0';
      const hostResult = '200';
      const libre = `Aplicación: ${item.nombre}. ${item.comentario || ''}`.substring(0, 100);

      // Limpiar comas para evitar saltos en CSV
      const cleanLibre = libre.replace(/,/g, ';');

      csvContent += `${usuario},${userSo},${fecha},${hora},${ip},${mac},${compName},${tipo},${result},${hostResult},${cleanLibre}\n`;
    });

    // Crear Data URI
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const fileName = `Reporte_Auditoria_Global_${new Date().getTime()}.csv`;

    // Enviar vía Puente (Sandbox)
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_CSV',
        payload: {
          fileName: fileName,
          data: dataUri
        }
      }, '*');
    } else {
      // Fallback
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  MostrarListadoGlobal() {
    // Alternar entre la vista de tarjetas y la vista de listado/tabla
    this.isListView = !this.isListView;
  }

  // Utilidades para formato
  private formatDate(date: Date): string {
    const d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('');
  }

  private formatTime(date: Date): string {
    const d = new Date(date),
      hours = '' + d.getHours(),
      minutes = '' + d.getMinutes(),
      seconds = '' + d.getSeconds();

    return [hours.padStart(2, '0'), minutes.padStart(2, '0'), seconds.padStart(2, '0')].join(':');
  }

}
