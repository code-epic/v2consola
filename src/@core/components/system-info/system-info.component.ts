// src/app/components/system-info/system-info.component.ts
import { Component, OnInit } from '@angular/core';
import { SystemInfoService } from '@services/apicore/system-info.service';

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss']
})
export class SystemInfoComponent implements OnInit {
  systemInfo: any = null;
  isLoading = true;

  constructor(private systemInfoService: SystemInfoService) { }

  ngOnInit(): void {
    this.systemInfoService.getSystemInfo().subscribe({
      next: (data) => {
        // Asegúrate de manejar el array o el objeto directamente
        this.systemInfo = Array.isArray(data) ? data[0] : data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading system info:', err);
        this.isLoading = false;
        // Opcional: Inicializar con datos vacíos para evitar errores
        this.systemInfo = this.getEmptySystemInfo();
      }
    });
  }

  getDiskUsagePercentage(usePercent: string): number {
    if (!usePercent) return 0;
    return parseFloat(usePercent.replace('%', '')) || 0;
  }

  // Función para crear un objeto vacío
  private getEmptySystemInfo(): any {
    return {
      system: {
        hostname: 'N/A',
        uptime: 'N/A',
        os: 'N/A',
        kernel: 'N/A',
        architecture: 'N/A'
      },
      cpu: {
        model: 'N/A',
        cores: 'N/A',
        threads: 'N/A',
        load_average: 'N/A'
      },
      memory: {
        total: 'N/A',
        used: 'N/A',
        free: 'N/A',
        swap_total: 'N/A',
        swap_used: 'N/A',
        swap_free: 'N/A'
      },
      disks: [],
      network: {
        ip_address: 'N/A',
        interfaces: 'N/A'
      },
      processes: {
        total: 0,
        running: 0
      },
      users: {
        logged_in: 0
      },
      timestamp: new Date().toISOString()
    };
  }
}