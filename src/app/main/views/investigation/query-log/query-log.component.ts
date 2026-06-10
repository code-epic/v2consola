import { Component, Input, OnInit, OnDestroy, TemplateRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label, BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UtilService } from '@services/util/util.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface QueryLog {
  date: string;
  type: string;
  file: string;
  line: string;
  query: string;
  error?: string;
  timestamp?: Date;
  showFullQuery?: boolean;
  shortQuery?: string;
  isCopied?: boolean;
}


@Component({
    selector: 'app-query-log',
    templateUrl: './query-log.component.html',
    styleUrls: ['./query-log.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: false
})
export class QueryLogComponent implements OnInit, OnDestroy {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @Input() rawLogs: string = '';
  parsedLogs: QueryLog[] = [];
  filteredLogs: QueryLog[] = [];
  logTypes: string[] = [];
  selectedType: string = '';
  searchText: string = '';
  isLoading: boolean = false;
  nameFnx = '';
  sinRegistros: boolean = false;
  activeId = 1;

  public lineChartData: ChartDataSets[] = [];

  public lineChartLabels: Label[] = [];

  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.5 // Curvas más orgánicas
      },
      point: {
        radius: 0, // Oculta los puntos por defecto (suaviza visualmente)
        hitRadius: 10, // Mantiene el área de interacción
        hoverRadius: 6, // Muestra el punto al pasar el mouse
        borderWidth: 2
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          fontColor: '#633d2bff',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
          callback: function (value) {
            return moment(value).format('DD MMM');
          }
        },
        gridLines: {
          display: false
        }
      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            fontColor: '#3016a1ff',
            fontSize: 10,
            fontFamily: 'Inter, sans-serif',
            beginAtZero: true,
            stepSize: 10,
            padding: 10
          },
          gridLines: {
            color: 'rgba(200, 200, 200, 0.1)', // Líneas de cuadrícula muy sutiles
            zeroLineColor: 'rgba(200, 200, 200, 0.1)',
            drawBorder: false,
            borderDash: [5, 5] // Líneas punteadas para suavizar
          }
        }
      ]
    },
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        padding: 20,
        fontColor: '#5e5873',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif'
      }
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.98)', // Más opaco para efecto tarjeta
      titleFontColor: '#1f2937',
      titleFontSize: 14, // Título más grande
      bodyFontColor: '#6b7280',
      bodyFontSize: 13, // Cuerpo más legible
      bodySpacing: 8, // Espacio entre líneas
      borderColor: 'rgba(115, 103, 240, 0.1)', // Borde sutil
      borderWidth: 1,
      cornerRadius: 16, // Bordes muy redondeados (efecto globo)
      xPadding: 20, // Más ancho
      yPadding: 15, // Más alto
      caretSize: 8,
      displayColors: false, // Eliminar los cuadritos
      callbacks: {
        title: function (tooltipItem, data) {
          // Capitalizar la primera letra del día
          const dateStr = moment(tooltipItem[0].label).format('dddd, D [de] MMMM');
          return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        },
        label: function (tooltipItem, data) {
          const label = data.datasets[tooltipItem.datasetIndex].label || '';
          const value = tooltipItem.yLabel;
          // Usar un círculo unicode grande como viñeta
          return `●  ${value} ${label}`;
        },
        labelTextColor: function (tooltipItem, chart) {
          return chart.config.data.datasets[tooltipItem.datasetIndex].borderColor as string;
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    annotation: {
      annotations: [],
    },
  };

  public lineChartColors: Color[] = [
    { // red (Error)
      backgroundColor: 'rgba(234, 84, 85, 0.1)', // Fondo muy sutil
      borderColor: '#ea5455',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#ea5455',
      pointHoverBackgroundColor: '#ea5455',
      pointHoverBorderColor: '#fff'
    },
    { // orange (Warning)
      backgroundColor: 'rgba(255, 159, 67, 0.1)',
      borderColor: '#ff9f43',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#ff9f43',
      pointHoverBackgroundColor: '#ff9f43',
      pointHoverBorderColor: '#fff'
    },
    { // purple (Alert)
      backgroundColor: 'rgba(115, 103, 240, 0.1)',
      borderColor: '#7367f0',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#7367f0',
      pointHoverBackgroundColor: '#7367f0',
      pointHoverBorderColor: '#fff'
    }
  ];

  public lineChartLegend = true;

  public lineChartType = 'line';

  public isView: boolean = true;

  private searchSubject = new Subject<string>();

  private searchSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
  ) {
    moment.locale('es');
  }

  async processChartData() {
    // Agrupar por fecha y tipo
    const dataByDate: { [key: string]: { [key: string]: number } } = {};
    const typesToTrack = ['ERROR', 'WARNING', 'ALERT'];

    // Ordenar logs cronológicamente para la gráfica
    const sortedLogs = [...this.parsedLogs].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

    sortedLogs.forEach(log => {
      if (!log.date) return;

      // Extraer solo la fecha YYYY/MM/DD
      const dateKey = log.date.split(' ')[0];

      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = { ERROR: 0, WARNING: 0, ALERT: 0 };
      }

      const type = log.type.toUpperCase();
      if (typesToTrack.includes(type)) {
        dataByDate[dateKey][type] = (dataByDate[dateKey][type] || 0) + 1;
      }
    });

    const categories = Object.keys(dataByDate);
    const errorSeries = categories.map(date => dataByDate[date].ERROR);
    const warningSeries = categories.map(date => dataByDate[date].WARNING);
    const alertSeries = categories.map(date => dataByDate[date].ALERT);

    this.lineChartLabels = categories;
    this.lineChartData = [
      { data: errorSeries, label: 'Errores' },
      { data: warningSeries, label: 'Advertencias' },
      { data: alertSeries, label: 'Alertas' }
    ];
  }

  async ngOnChanges() {
    this.nameFnx = this.rawLogs;
    this.sinRegistros = true;
    await this.verLogs();
  }

  ngOnInit() {


    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms después de la última pulsación
      distinctUntilChanged() // Solo emite si el valor ha cambiado
    ).subscribe(searchValue => {
      this.filterLogs();
    });

    this.nameFnx = this.rawLogs;
    this.verLogs();
  }

  async verLogs() {
    this.isLoading = true;
    let fnx = { funcion: this.nameFnx };
    await this.apiService.ExecFnx(fnx).subscribe(
      async (data) => {
        if (data.msj == '' || data.msj == null) {
          this.utilservice.AlertMini(
            "top-end",
            "warning",
            `No hay registros de logs actualmente`,
            3000
          )
          this.sinRegistros = false;
          return;
        }
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (data) => {
              this.rawLogs = data.rs;
              this.parseLogs();
              this.filterLogs(); // Esto mantiene todos los registros filtrados
              this.processChartData(); // Call the new chart data processing method
              this.isLoading = false;
            },
            (error) => {
              console.log(error);
              this.isLoading = false;
            }
          );
        }, 3000);
      },
      (error) => {
        console.log(error);
        this.isLoading = false;
      }
    );
  }

  verGraficos() {
    this.isView = !this.isView;
  }

  parseLogs() {
    if (!this.rawLogs) return;

    const logLines = this.rawLogs.split('\n');
    this.parsedLogs = [];
    let currentQuery: Partial<QueryLog> = {};
    let collectingQuery = false;

    logLines.forEach(line => {
      if (!line.trim()) return;

      const logStartMatch = line.match(/^(WARNING|ERROR|ALERT|INFO):\s(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s([^:]+):(\d+):/);

      if (logStartMatch) {
        if (currentQuery.type) {
          this.processQuery(currentQuery);
          this.parsedLogs.push(currentQuery as QueryLog);
        }

        currentQuery = {
          type: logStartMatch[1],
          date: logStartMatch[2],
          file: logStartMatch[3],
          line: logStartMatch[4],
          timestamp: new Date(logStartMatch[2].replace(/\//g, '-')),
          showFullQuery: false
        };

        const messageStart = logStartMatch[0].length;
        currentQuery.query = line.substring(messageStart).trim();
        collectingQuery = true;
      } else if (collectingQuery) {
        if (currentQuery.query) {
          currentQuery.query += '\n' + line.trim();
        }
      }
    });

    if (currentQuery.type) {
      this.processQuery(currentQuery);
      this.parsedLogs.push(currentQuery as QueryLog);
    }

    this.logTypes = [...new Set(this.parsedLogs.map(log => log.type))];
    this.parsedLogs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  processQuery(log: Partial<QueryLog>) {
    if (!log.query) return;

    // Quitar espacios en blanco al inicio de cada línea
    log.query = log.query.split('\n').map(line => line.trimStart()).join('\n');

    // Eliminar hashes MD5 (32 caracteres hexadecimales)
    log.query = log.query.replace(/[a-fA-F0-9]{32}/g, '').trim();

    // Extraer error si existe
    const errorMatch = log.query.match(/(Error \d+: .+)/);
    if (errorMatch) {
      log.error = errorMatch[1];
      log.query = log.query.replace(errorMatch[1], '').trim();
    }

    // Resumen específico para WARNINGS
    if (log.type === 'WARNING' && log.query.includes('Core.Select:')) {
      const match = log.query.match(/Core.Select:\s*([^\n]+)/);
      log.shortQuery = match ? `ADVERTENCIA: ${match[1].substring(0, 80)}...` : 'Advertencia en consulta...';
      log.query = log.query.replace('Core.Select:', 'Core.Select:\n-------------------------------------------------------------\n');
      return;
    }

    // Crear versión corta
    if (log.query.includes('Core.Select:')) {
      const coreIndex = log.query.indexOf('Core.Select:');
      const firstNewLine = log.query.indexOf('\n', coreIndex);

      if (firstNewLine > -1) {
        log.shortQuery = log.query.substring(0, firstNewLine) + '\n...';
      } else {
        log.shortQuery = log.query.substring(0, coreIndex + 20) + '...';
      }

      // Formatear el query completo con separadores
      log.query = log.query.replace('Core.Select:', 'Core.Select:\n-------------------------------------------------------------\n');
    } else {
      log.shortQuery = log.query.length > 100 ?
        log.query.substring(0, 100) + '...' :
        log.query;
    }
  }

  toggleView(log: QueryLog) {
    log.showFullQuery = !log.showFullQuery;
  }

  copyToClipboard(log: QueryLog) {
    if (log.query) {
      navigator.clipboard.writeText(log.query).then(() => {
        log.isCopied = true;
        setTimeout(() => {
          log.isCopied = false;
        }, 2000);
      }).catch(err => {
        console.error('Error al copiar al portapapeles', err);
      });
    }
  }

  descargarLogs() {
    if (this.filteredLogs.length === 0) {
      return;
    }

    Swal.fire({
      title: "Descargar Logs",
      text: "¿Estas seguro de descargar los logs?",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Descargar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadLogs();
      }
    });

  }

  downloadLogs() {
    let content = `Reporte de Consultas SQL - ${new Date().toLocaleString()}\n\n`;
    content += `Filtros aplicados: Tipo=${this.selectedType || 'Todos'}, Búsqueda='${this.searchText}'\n`;
    content += `Total de registros: ${this.filteredLogs.length}\n`;
    content += '============================================================\n\n';

    this.filteredLogs.forEach(log => {
      content += `[${log.type}] - ${log.date} - ${log.file}:${log.line}\n`;
      content += `Consulta: ${log.query}\n`;
      if (log.error) {
        content += `Error: ${log.error}\n`;
      }
      content += '------------------------------------------------------------\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  filterLogs() {
    this.filteredLogs = this.parsedLogs.filter(log => {
      const matchesType = this.selectedType === '' || log.type === this.selectedType;
      const matchesSearch = this.searchText === '' ||
        (log.query && log.query.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (log.error && log.error.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (log.file && log.file.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (log.date && log.date.toLowerCase().includes(this.searchText.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }

  onTypeChange(type: string) {
    this.selectedType = type;
    this.filterLogs();
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.searchSubject.next(searchText);
  }

  getIconForType(type: string): string {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'error': return 'x-octagon';
      case 'alert': return 'alert-octagon';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      case 'select': return 'search';
      case 'update': return 'edit-2';
      case 'insert': return 'plus-circle';
      case 'delete': return 'trash-2';
      default: return 'database';
    }
  }

  getLogClass(log: any): any {
    const classes = {
      'error': log.type.toLowerCase() === 'error' || log.error,
      'warning': log.type.toLowerCase() === 'warning',
      'alert': log.type.toLowerCase() === 'alert',
      'info': log.type.toLowerCase() === 'info',
      'select': log.type.toLowerCase() === 'select',
      'update': log.type.toLowerCase() === 'update',
      'insert': log.type.toLowerCase() === 'insert',
      'delete': log.type.toLowerCase() === 'delete',
      'default': true
    };
    return classes;
  }

  getErrorCount(): number {
    return this.filteredLogs.filter(log => log.error || log.type.toLowerCase().includes('error')).length;
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  selTab(event: any) {
    console.log(this.activeId);
    if (this.activeId === 2) {
      if (this.chart && this.chart.chart) {
        this.chart.chart.update();
        this.chart.chart.resize();
      }
    }

  }

  get currentDate(): string {
    return moment().format('DD/MM/YYYY HH:mm');
  }

  exportToPDF() {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Estadísticas de Logs', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado el: ${this.currentDate}`, 14, 30);

    // Summary Stats
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumen General', 14, 45);

    doc.setFontSize(10);
    doc.text(`Total de Consultas: ${this.filteredLogs.length}`, 14, 55);
    doc.text(`Total de Errores: ${this.getErrorCount()}`, 14, 62);

    // Table
    const tableColumn = ["Tipo", "Fecha", "Archivo", "Mensaje"];
    const tableRows = [];

    this.filteredLogs.forEach(log => {
      const logData = [
        log.type,
        log.date,
        `${log.file}:${log.line}`,
        log.shortQuery || log.query.substring(0, 50) + '...'
      ];
      tableRows.push(logData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [115, 103, 240] }
    });

    doc.save(`reporte-logs-${moment().format('YYYY-MM-DD')}.pdf`);
  }

}