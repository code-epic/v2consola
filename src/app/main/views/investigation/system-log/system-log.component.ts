import { Component, Input } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';

interface SystemLog {
  date: string;
  type: string;
  file: string;
  message: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-system-log',
  templateUrl: './system-log.component.html',
  styleUrls: ['./system-log.component.scss']
})
export class SystemLogComponent {
  @Input() rawLogs: string = '';
  parsedLogs: SystemLog[] = [];
  filteredLogs: SystemLog[] = [];
  logTypes: string[] = [];
  selectedType: string = 'ALL';
  searchText: string = '';
  isLoading: boolean = false; // Nueva propiedad para controlar el estado de carga

  constructor(private apiService: ApiService) { }

  async ngOnChanges() {
    await this.verLogs();
  }

  async verLogs() {
    this.isLoading = true; // Activar estado de carga
    let nameFnx = "Fnx_SystemLog";
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

    logLines.forEach(line => {
      if (!line.trim()) return;

      // Formato esperado: ALERT: 2025/03/28 08:20:58 conexion.go:44: pq: role "postgres" does not exist
      const parts = line.split(':').map(part => part.trim());
      
      if (parts.length >= 5) {
        const type = parts[0];
        const dateTime = parts[1].split(' ');
        const date = dateTime[0];
        const time = dateTime[1];
        const file = parts[2] + ':' + parts[3];
        const message = parts.slice(4).join(':').trim();

        const logEntry: SystemLog = {
          type: type,
          date: `${date} ${time}`,
          file: file,
          message: message,
          timestamp: new Date(`${date} ${time}`)
        };

        this.parsedLogs.push(logEntry);
      }
    });

    // Extraer tipos únicos de logs
    this.logTypes = ['ALL', ...new Set(this.parsedLogs.map(log => log.type))];
    
    // Ordenar por fecha (más reciente primero)
    this.parsedLogs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  filterLogs() {
    this.filteredLogs = this.parsedLogs.filter(log => {
      const matchesType = this.selectedType === 'ALL' || log.type === this.selectedType;
      const matchesSearch = this.searchText === '' || 
        log.message.toLowerCase().includes(this.searchText.toLowerCase()) ||
        log.file.toLowerCase().includes(this.searchText.toLowerCase()) ||
        log.date.toLowerCase().includes(this.searchText.toLowerCase());
      
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