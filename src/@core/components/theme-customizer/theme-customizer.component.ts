import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreDirectivesModule } from '@core/directives/directives';
import { TaskMonitorComponent } from '@core/components/task-monitor/task-monitor.component';
import { SystemInfoComponent } from '@core/components/system-info/system-info.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreConfigService } from '@core/services/config.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { ApiService } from '@services/apicore/api.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';


@Component({
    selector: 'core-theme-customizer',
    templateUrl: './theme-customizer.component.html',
    styleUrls: ['./theme-customizer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, CoreDirectivesModule, TaskMonitorComponent, SystemInfoComponent]
})
export class CoreThemeCustomizerComponent implements OnInit, OnDestroy {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  public searchValue = ''
  public contentHeader: object;

  certificateData = {
    name: '',
    publicCert: null as File | null,
    privateKey: null as File | null,
    password: ''
  };

  uploading = false;
  errorMessage = '';
  successMessage = '';

  certificates: any[] = [];
  loadingCerts = false;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor

   * @param {FormBuilder} _formBuilder
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreSidebarService} _coreSidebarService
   * */
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _coreConfigService: CoreConfigService,
    private _coreSidebarService: CoreSidebarService,
    private taskService: TaskService,
    private msjService: WsocketsService,
    private apiService: ApiService
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  //  Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {
    this.loadCertificates();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
  }

  //  Private methods
  // -----------------------------------------------------------------------------------------------------


  onFileSelected(event: Event, fileType: 'publicCert' | 'privateKey') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.certificateData[fileType] = input.files[0];
    }
  }

  onSubmit() {
    if (!this.certificateData.publicCert || !this.certificateData.privateKey) {
      this.errorMessage = 'Por favor, seleccione ambos archivos';
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Aquí iría la lógica para subir los archivos al servidor
    // Ejemplo:
    /*
    this.certificateService.uploadCertificate(
      this.certificateData.name,
      this.certificateData.publicCert,
      this.certificateData.privateKey,
      this.certificateData.password
    ).subscribe({
      next: (response) => {
        this.uploading = false;
        this.successMessage = 'Certificado subido correctamente';
        this.resetForm();
      },
      error: (err) => {
        this.uploading = false;
        this.errorMessage = 'Error al subir el certificado: ' + err.message;
      }
    });
    */

    // Simulación de subida (eliminar en implementación real)
    setTimeout(() => {
      this.uploading = false;
      this.successMessage = 'Simulación: Certificado subido correctamente';
      console.log('Datos del certificado:', this.certificateData);
    }, 1500);
  }

  resetForm() {
    this.certificateData = {
      name: '',
      publicCert: null,
      privateKey: null,
      password: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadCertificates() {
    this.loadingCerts = true;
    this.apiService.ListCertificates(false).subscribe({
      next: (data) => {
        this.certificates = Array.isArray(data) ? data : [];
        this.loadingCerts = false;
      },
      error: () => this.loadingCerts = false
    });
  }

  downloadCertificate(cert: any, format: string) {
    this.apiService.DownloadCertificate(cert.path, format).subscribe({
      next: (blob: Blob) => {
        const ext = format === 'p12' || format === 'pfx' || format === 'pkcs12' ? 'p12'
          : format === 'p7b' || format === 'pkcs7' ? 'p7b' : format;
        const filename = cert.name.replace(/\.[^.]+$/, '') + '.' + ext;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error descargando certificado:', err)
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Toggle sidebar open
   *
   * @param key
   */
  toggleSidebar(key): void {
    this._coreSidebarService.getSidebarRegistry(key).toggleOpen();
  }
}
