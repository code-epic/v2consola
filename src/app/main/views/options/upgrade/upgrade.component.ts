import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked'; // Popular librería para parsear Markdown

interface VersionIndex {
  version: string;
  date: string;
  path: string;
  icon: string;
  color: string;
}

@Component({
    selector: 'app-upgrade',
    templateUrl: './upgrade.component.html',
    styleUrls: ['./upgrade.component.scss'],
    standalone: false
})
export class UpgradeComponent implements OnInit {

  public versions: VersionIndex[] = [];
  public selectedVersion: VersionIndex | null = null;
  public currentContent: SafeHtml = '';
  public isLoading: boolean = true;

  public contentHeader = {
    headerTitle: 'Opciones',
    actionButton: false,
    breadcrumb: {
      type: '',
      links: [
        { name: 'Principal', isLink: true, link: '/home' },
        { name: 'Opciones', isLink: false },
        { name: 'Novedades', isLink: false }
      ]
    }
  };

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadVersionIndex();
  }

  loadVersionIndex() {
    this.http.get('assets/changes/index-change.md', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.versions = this.parseIndex(data);
          if (this.versions.length > 0) {
            // Cargar la última versión por defecto
            this.loadVersion(this.versions[0]);
          }
        },
        error: (err) => {
          console.error('Error al cargar el índice de versiones:', err);
          this.currentContent = this.sanitizer.bypassSecurityTrustHtml(
            `<h2>Error al cargar novedades</h2><p>No se pudo encontrar el archivo de índice de versiones.</p>`
          );
          this.isLoading = false;
        }
      });
  }

  parseIndex(content: string): VersionIndex[] {
    const lines = content.split('\n').filter(line => line.startsWith('- ['));
    return lines.map(line => {
      const versionMatch = line.match(/\[(v[\d.]+)\]/);
      const pathMatch = line.match(/\((.*?)\)/);
      const dateMatch = line.match(/\]\((.*?)\)\s-\s(.*?)$/);

      const ver = versionMatch ? versionMatch[1] : 'v0.0.0';

      // Lógica de Iconos y Colores más variada para evitar repetición visual
      let icon = 'tag';
      let color = 'secondary';
      const lastDigit = parseInt(ver.slice(-1)) || 0;

      if (ver.endsWith('.0.0')) {
        icon = 'award'; // Major Release
        color = 'success';
      } else if (ver.endsWith('.0')) {
        icon = 'gift'; // Minor Release
        color = 'primary';
      } else {
        // Variación para parches basada en el último dígito
        switch (lastDigit % 6) {
          case 1: icon = 'zap'; color = 'warning'; break;     // Performance
          case 2: icon = 'shield'; color = 'danger'; break;   // Security
          case 3: icon = 'layout'; color = 'info'; break;     // UI/UX
          case 4: icon = 'star'; color = 'warning'; break;    // Features
          case 5: icon = 'box'; color = 'primary'; break;     // Components
          default: icon = 'tool'; color = 'secondary'; break; // Fixes
        }
      }

      return {
        version: ver,
        path: pathMatch ? pathMatch[1] : '',
        date: dateMatch ? dateMatch[1] : 'N/A',
        icon: icon,
        color: color
      };
    });
  }

  async loadVersion(version: VersionIndex) {
    if (!version || !version.path) return;

    this.isLoading = true;
    this.selectedVersion = version;

    this.http.get(`assets/changes/${version.path}`, { responseType: 'text' })
      .subscribe({
        next: async (markdownContent) => { // Hacemos el callback asíncrono
          // Usamos 'await' para esperar el resultado de la promesa si es que la devuelve.
          const htmlContent = await marked.parse(markdownContent);
          this.currentContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error(`Error al cargar el archivo de la versión ${version.version}:`, err);
          const errorHtml = `
            <div class="text-center p-5 my-4 empty-state">
              <img src="assets/images/illustration/server-down.webp" height="200" alt="Contenido no encontrado" class="mb-4">
              <h2 class="font-weight-bold text-danger">Contenido No Disponible</h2>
              <p class="lead text-muted" style="font-size: 1.1rem; letter-spacing: 0.5px;">
                Lo sentimos, no se pudo cargar el detalle para la versión
                <strong>${version.version}</strong>.
              </p>
            </div>`;
          this.currentContent = this.sanitizer.bypassSecurityTrustHtml(errorHtml);
          this.isLoading = false;
        }
      });
  }
}