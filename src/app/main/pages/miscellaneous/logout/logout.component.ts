import { Component, OnInit, NgZone, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from '@services/seguridad/login.service';

import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreCommonModule } from '@core/common.module';


interface LogoutStep {
  key: string;
  label: string;
  status: 'pending' | 'in-progress' | 'done' | 'error';
}

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, NgbModule, CoreCommonModule]
})
export class LogoutComponent implements OnInit, OnDestroy {
  private _steps = signal<LogoutStep[]>([
    { key: 'SERVER_LOGOUT', label: 'Finalizando sesión en el servidor', status: 'pending' },
    { key: 'CLEAR_SESSION', label: 'Limpiando datos de la sesión local', status: 'pending' },
    { key: 'REDIRECT', label: 'Redirigiendo', status: 'pending' }
  ]);
  get steps() { return this._steps(); }

  private _finalMessage = signal('');
  get finalMessage() { return this._finalMessage(); }
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
    this._steps.update(currentSteps => {
      const currentStepIndex = currentSteps.findIndex(s => s.key === stepKey);
      if (currentStepIndex === -1) return currentSteps;
      const newSteps = currentSteps.map((step, i) => {
        if (i < currentStepIndex && step.status !== 'error') {
          return { ...step, status: 'done' as const };
        }
        if (i === currentStepIndex) {
          if (message.includes('No se pudo')) {
            return { ...step, status: 'error' as const };
          } else if (message === '¡Hasta pronto!') {
            this._finalMessage.set('¡Sesión cerrada con éxito!');
            return { ...step, status: 'done' as const };
          } else {
            return { ...step, status: 'in-progress' as const };
          }
        }
        return step;
      });
      return newSteps;
    });
  }
    /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions (including the timer)
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();

    // Explicitly unsubscribe from the timer if it's still active
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }
}