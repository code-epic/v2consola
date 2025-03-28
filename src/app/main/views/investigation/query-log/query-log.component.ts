import { Component, Input } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';

interface QueryLog {
  date: string;
  type: string;
  file: string;
  line: string;
  query: string;
  error?: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-query-log',
  templateUrl: './query-log.component.html',
  styleUrls: ['./query-log.component.scss']
})
export class QueryLogComponent {
  @Input() rawLogs: string = '';
  parsedLogs: QueryLog[] = [];
  filteredLogs: QueryLog[] = [];
  logTypes: string[] = [];
  selectedType: string = 'ALL';
  searchText: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) { }

  async ngOnChanges() {
    await this.verLogs()
  }

  async verLogs() {
    this.isLoading = true; // Activar estado de carga
    let nameFnx = "Fnx_QueryLog";
    let fnx = { funcion: nameFnx };
    
    await this.apiService.ExecFnx(fnx).subscribe(
      async (data) => {
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (data) => {
              this.rawLogs = data.rs;
              this.parseLogs();
              this.filterLogs();
              this.isLoading = false; // Desactivar estado de carga
            },
            (error) => {
              console.log(error);
              this.isLoading = false; // Desactivar estado de carga en caso de error
            }
          );
        }, 3000);
      },
      (error) => {
        console.log(error);
        this.isLoading = false; // Desactivar estado de carga en caso de error
      }
    );
  }

  parseLogs() {
    if (!this.rawLogs) return;

    const logLines = this.rawLogs.split('\n');
    this.parsedLogs = [];
    let currentQuery: Partial<QueryLog> = {};
    let collectingQuery = false;

    logLines.forEach(line => {
      if (!line.trim()) return;

      // Detectar líneas de inicio de log (ej: WARNING: 2025/03/28 08:29:51 sql_select.go:30:)
      const logStartMatch = line.match(/^(WARNING|ERROR|ALERT|INFO):\s(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s([^:]+):(\d+):/);
      
      if (logStartMatch) {
        // Guardar el query anterior si existe
        if (currentQuery.type) {
          this.parsedLogs.push(currentQuery as QueryLog);
        }

        // Iniciar nuevo log
        currentQuery = {
          type: logStartMatch[1],
          date: logStartMatch[2],
          file: logStartMatch[3],
          line: logStartMatch[4],
          timestamp: new Date(logStartMatch[2].replace(/\//g, '-'))
        };
        
        // El resto de la línea es el inicio del query o mensaje
        const messageStart = logStartMatch[0].length;
        currentQuery.query = line.substring(messageStart).trim();
        collectingQuery = true;
      } else if (collectingQuery) {
        // Continuación de un query
        if (currentQuery.query) {
          currentQuery.query += '\n' + line.trim();
        }
      }
    });

    // Añadir el último log si existe
    if (currentQuery.type) {
      this.parsedLogs.push(currentQuery as QueryLog);
    }

    // Extraer tipos únicos de logs
    this.logTypes = ['ALL', ...new Set(this.parsedLogs.map(log => log.type))];
    
    // Ordenar por fecha (más reciente primero)
    this.parsedLogs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    
    // Identificar errores en los queries
    this.parsedLogs.forEach(log => {
      const errorMatch = log.query.match(/Error \d+: (.+)/);
      if (errorMatch) {
        log.error = errorMatch[1];
      }
    });
  }

  filterLogs() {
    this.filteredLogs = this.parsedLogs.filter(log => {
      const matchesType = this.selectedType === 'ALL' || log.type === this.selectedType;
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
    this.filterLogs();
  }
}