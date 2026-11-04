import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services/apicore/api.service';
import { LoginService } from '@services/seguridad/login.service';
import { environment } from 'environments/environment';

export interface IEcosystemNode {
  id: string;
  title: string;
  category: string;
  description: string;
  telemetry: string;
  status: string;
  icon: string;
  badgeClass: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' },
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  public logoUrl: string = 'assets/images/logo/sandra.png';
  public usuarioNombre: string = '';
  public usuarioCorreo: string = '';
  public usuarioSistema: string = '';
  public version: string = environment.version || '1.0.0';
  public buildDate: string = environment.buildDateTime || 'Sat Oct 31 2026';
  public currentDate: Date = new Date();

  // Nodos representativos del ecosistema Sandra Server Core L7
  public leftEcosystemNodes: IEcosystemNode[] = [
    {
      id: 'core-l7',
      title: 'Sandra Core L7',
      category: 'Seguridad de Aplicación',
      description: 'Defensa perimetral con reto criptográfico PoW y verificación de cabeceras',
      telemetry: 'Cifrado AES-256 / SHA-256',
      status: 'Activo',
      icon: 'shield',
      badgeClass: 'badge-emerald'
    },
    {
      id: 'apicore',
      title: 'APICore Engine',
      category: 'Micro-Kernel de Servicios',
      description: 'Orquestación de funciones del servidor y control de drivers de persistencia',
      telemetry: 'Drivers MGDBA & Core Sync',
      status: 'Sincronizado',
      icon: 'cpu',
      badgeClass: 'badge-cyan'
    }
  ];

  public rightEcosystemNodes: IEcosystemNode[] = [
    {
      id: 'telemetria',
      title: 'Telemetría WSS',
      category: 'Canal de Comunicación',
      description: 'Streaming bidireccional seguro de eventos, sockets y telemetría de red',
      telemetry: 'TLS 1.3 / WebSocket Seguro',
      status: 'En Línea',
      icon: 'radio',
      badgeClass: 'badge-purple'
    },
    {
      id: 'boveda',
      title: 'Bóveda & Trazabilidad',
      category: 'Criterio & Auditoría',
      description: 'Custodia de certificados, registro inmutable y prevención de fuga de datos',
      telemetry: 'Integridad SysLog Verificada',
      status: 'Protegido',
      icon: 'lock',
      badgeClass: 'badge-amber'
    }
  ];

  constructor(
    private apiService: ApiService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = this.loginService.getUserDecrypt(token);
        if (decoded?.Usuario) {
          this.usuarioNombre = decoded.Usuario.nombre || decoded.Usuario.cedula || 'Operador';
          this.usuarioCorreo = decoded.Usuario.correo || '';
          this.usuarioSistema = decoded.Usuario.sistema || 'Sandra L7';
        }
      } catch (err) {
        console.warn('[HomeComponent] Error decodificando token:', err);
      }
    }
  }
}
