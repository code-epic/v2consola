import { Component, OnInit, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LoginService } from '@services/seguridad/login.service';

import { Subject } from 'rxjs'; // Import timer

import { CoreConfigService } from '@core/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


interface LogoutStep {
  key: string;
  label: string;
  status: 'pending' | 'in-progress' | 'done' | 'error';
}

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit, OnDestroy {
  public steps: LogoutStep[] = [
    { key: 'SERVER_LOGOUT', label: 'Finalizando sesión en el servidor', status: 'pending' },
    { key: 'CLEAR_SESSION', label: 'Limpiando datos de la sesión local', status: 'pending' },
    { key: 'REDIRECT', label: 'Redirigiendo', status: 'pending' }
  ];
  public finalMessage: string = '';
  // Mapea los mensajes del servicio a las claves de los pasos
  private messageToStepKey: { [message: string]: string } = {
    'Finalizando sesión en el servidor...': 'SERVER_LOGOUT',
    'No se pudo contactar al servidor, limpiando localmente...': 'SERVER_LOGOUT',
    'Limpiando datos de la sesión...': 'CLEAR_SESSION',
    '¡Hasta pronto!': 'REDIRECT'
  };
  public coreConfig: any;
  public countdown: number = 10; // Initial countdown value
  private _timerSubscription: any; // To hold the timer subscription

  // Private
  private _unsubscribeAll: Subject<any>; // Keep for general subscriptions


  constructor(
    private _coreConfigService: CoreConfigService, 
    private loginService: LoginService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) { 
     this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };

  }

  ngOnInit(): void {
    this.modalService.dismissAll();
    this.executeLogout();
  }

  async executeLogout(): Promise<void> {
    await this.loginService.performLogoutProcess((message: string) => {
      this.ngZone.run(() => {
        this.updateStepStatus(message);
      });
    });
  }

  private updateStepStatus(message: string): void {
    const stepKey = this.messageToStepKey[message];
    if (!stepKey) return;
    const currentStepIndex = this.steps.findIndex(s => s.key === stepKey);
    if (currentStepIndex === -1) return;
    // Marcar todos los pasos anteriores como 'completados'
    for (let i = 0; i < currentStepIndex; i++) {
      if (this.steps[i].status !== 'error') {
        this.steps[i].status = 'done';
      }
    }
    // Marcar el paso actual
    const currentStep = this.steps[currentStepIndex];
    if (message.includes('No se pudo')) {
      currentStep.status = 'error';
    } else if (message === '¡Hasta pronto!') {
      currentStep.status = 'done';
      this.finalMessage = '¡Sesión cerrada con éxito!';
    } else {
      currentStep.status = 'in-progress';
    }
    this.cdr.detectChanges();
  }
    /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions (including the timer)
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    // Explicitly unsubscribe from the timer if it's still active
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }
}