import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreConfigService } from '@core/services/config.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';

import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';


@Component({
  selector: 'core-theme-customizer',
  templateUrl: './theme-customizer.component.html',
  styleUrls: ['./theme-customizer.component.scss'],
  encapsulation: ViewEncapsulation.None
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
    private msjService: WsocketsService
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
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
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

  /**
   * Toggle sidebar open
   *
   * @param key
   */
  toggleSidebar(key): void {
    this._coreSidebarService.getSidebarRegistry(key).toggleOpen();
  }
}
