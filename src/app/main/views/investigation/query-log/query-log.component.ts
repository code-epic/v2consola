import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, ViewEncapsulation, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/apicore/api.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import moment from 'moment';
import Swal from 'sweetalert2';
import { UtilService } from '@services/util/util.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CoreCommonModule } from '@core/common.module';

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
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CoreCommonModule,
        CoreDirectivesModule,
        BaseChartDirective
    ]
})
export class QueryLogComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @Input() rawLogs: string = '';
  rawLogContent: string = '';
  parsedLogs: QueryLog[] = [];
  filteredLogs: QueryLog[] = [];
  logTypes: string[] = [];
  selectedTypeCtrl = new FormControl('');
  get selectedType() { return this.selectedTypeCtrl.value; }
  searchTextCtrl = new FormControl('');
  get searchText() { return this.searchTextCtrl.value; }
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  nameFnx = '';
  sinRegistros: boolean = true;
  activeId = 1;

  public chartData: ChartData<'line'> = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.5
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 6,
        borderWidth: 2
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#633d2bff',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          callback: function (value) {
            return moment(value as string).format('DD MMM');
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        ticks: {
          color: '#3016a1ff',
          font: {
            size: 10,
            family: 'Inter, sans-serif'
          },
          stepSize: 10,
          padding: 10
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)',
          tickColor: 'rgba(200, 200, 200, 0.1)',
          drawOnChartArea: true,
          display: true
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          color: '#5e5873',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1f2937',
        titleFont: {
          size: 14
        },
        bodyColor: '#6b7280',
        bodyFont: {
          size: 13
        },
        bodySpacing: 8,
        borderColor: 'rgba(115, 103, 240, 0.1)',
        borderWidth: 1,
        cornerRadius: 16,
        padding: 20,
        caretSize: 8,
        displayColors: false,
        callbacks: {
          title: function (tooltipItem) {
            const dateStr = moment(tooltipItem[0].label).format('dddd, D [de] MMMM');
            return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
          },
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset;
            const label = dataset.label || '';
            const value = tooltipItem.parsed.y;
            return `\u25CF  ${value} ${label}`;
          },
          labelTextColor: function (tooltipItem) {
            const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
            return ((meta.dataset as any)?.borderColor as string) || '#7367f0';
          }
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };

  public isView: boolean = true;

  private searchSubject = new Subject<string>();

  private searchSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private cdr: ChangeDetectorRef,
  ) {
    moment.locale('es');
  }

  async processChartData() {
    const dataByDate: { [key: string]: { [key: string]: number } } = {};
    const typesToTrack = ['ERROR', 'WARNING', 'ALERT'];

    const sortedLogs = [...this.parsedLogs].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

    sortedLogs.forEach(log => {
      if (!log.date) return;

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

    this.chartData = {
      labels: categories,
      datasets: [
        {
          data: errorSeries,
          label: 'Errores',
          backgroundColor: 'rgba(234, 84, 85, 0.1)',
          borderColor: '#ea5455',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ea5455',
          pointHoverBackgroundColor: '#ea5455',
          pointHoverBorderColor: '#fff'
        },
        {
          data: warningSeries,
          label: 'Advertencias',
          backgroundColor: 'rgba(255, 159, 67, 0.1)',
          borderColor: '#ff9f43',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ff9f43',
          pointHoverBackgroundColor: '#ff9f43',
          pointHoverBorderColor: '#fff'
        },
        {
          data: alertSeries,
          label: 'Alertas',
          backgroundColor: 'rgba(115, 103, 240, 0.1)',
          borderColor: '#7367f0',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#7367f0',
          pointHoverBackgroundColor: '#7367f0',
          pointHoverBorderColor: '#fff'
        }
      ]
    };
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['rawLogs'] && this.rawLogs) {
      this.nameFnx = this.rawLogs;
      this.sinRegistros = true;
      this.parsedLogs = [];
      this.filteredLogs = [];
      await this.verLogs();
    }
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterLogs();
      this.cdr.markForCheck();
    });

    if (!this.nameFnx && this.rawLogs) {
      this.nameFnx = this.rawLogs;
      this.sinRegistros = true;
      this.verLogs();
    }
  }

  async verLogs() {
    if (!this.nameFnx) return;
    this._isLoading.set(true);
    this.sinRegistros = true;
    this.cdr.markForCheck();
    let fnx = { funcion: this.nameFnx };
    this.apiService.ExecFnx(fnx).subscribe(
      async (data) => {
        if (!data || data.msj == '' || data.msj == null || !data.contenido?.id) {
          this.utilservice.AlertMini(
            "top-end",
            "warning",
            `No hay registros de logs actualmente`,
            3000
          );
          this.sinRegistros = false;
          this._isLoading.set(false);
          this.cdr.markForCheck();
          return;
        }
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (res) => {
              this.rawLogContent = res?.rs || '';
              this.parseLogs();
              this.filterLogs();
              this.processChartData();
              this._isLoading.set(false);
              this.cdr.markForCheck();
            },
            (error) => {
              console.log(error);
              this._isLoading.set(false);
              this.cdr.markForCheck();
            }
          );
        }, 3000);
      },
      (error) => {
        console.log(error);
        this._isLoading.set(false);
        this.cdr.markForCheck();
      }
    );
  }

  verGraficos() {
    this.isView = !this.isView;
    this.cdr.markForCheck();
  }

  parseLogs() {
    const content = this.rawLogContent || '';
    if (!content) {
      this.parsedLogs = [];
      return;
    }

    const logLines = content.split('\n');
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

    log.query = log.query.split('\n').map(line => line.trimStart()).join('\n');

    log.query = log.query.replace(/[a-fA-F0-9]{32}/g, '').trim();

    const errorMatch = log.query.match(/(Error \d+: .+)/);
    if (errorMatch) {
      log.error = errorMatch[1];
      log.query = log.query.replace(errorMatch[1], '').trim();
    }

    if (log.type === 'WARNING' && log.query.includes('Core.Select:')) {
      const match = log.query.match(/Core.Select:\s*([^\n]+)/);
      log.shortQuery = match ? `ADVERTENCIA: ${match[1].substring(0, 80)}...` : 'Advertencia en consulta...';
      log.query = log.query.replace('Core.Select:', 'Core.Select:\n-------------------------------------------------------------\n');
      return;
    }

    if (log.query.includes('Core.Select:')) {
      const coreIndex = log.query.indexOf('Core.Select:');
      const firstNewLine = log.query.indexOf('\n', coreIndex);

      if (firstNewLine > -1) {
        log.shortQuery = log.query.substring(0, firstNewLine) + '\n...';
      } else {
        log.shortQuery = log.query.substring(0, coreIndex + 20) + '...';
      }

      log.query = log.query.replace('Core.Select:', 'Core.Select:\n-------------------------------------------------------------\n');
    } else {
      log.shortQuery = log.query.length > 100 ?
        log.query.substring(0, 100) + '...' :
        log.query;
    }
  }

  toggleView(log: QueryLog) {
    log.showFullQuery = !log.showFullQuery;
    this.cdr.markForCheck();
  }

  copyToClipboard(log: QueryLog) {
    if (log.query) {
      navigator.clipboard.writeText(log.query).then(() => {
        log.isCopied = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          log.isCopied = false;
          this.cdr.markForCheck();
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

  onTypeChange() {
    this.filterLogs();
    this.cdr.markForCheck();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTextCtrl.value);
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

    doc.setFontSize(18);
    doc.text('Reporte de Estadísticas de Logs', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado el: ${this.currentDate}`, 14, 30);

    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumen General', 14, 45);

    doc.setFontSize(10);
    doc.text(`Total de Consultas: ${this.filteredLogs.length}`, 14, 55);
    doc.text(`Total de Errores: ${this.getErrorCount()}`, 14, 62);

    const tableColumn = ["Tipo", "Fecha", "Archivo", "Mensaje"];
    const tableRows: any[] = [];

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
