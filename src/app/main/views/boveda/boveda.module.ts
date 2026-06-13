import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CoreCardModule } from '@core/components/core-card/core-card.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthorizationComponent } from './authorization/authorization.component';
import { ReportesComponent } from './reportes/reportes.component';
import { CrontabComponent } from './crontab/crontab.component';

const routes: Routes = [
  {
    path: 'boveda/authorization',
    component: AuthorizationComponent,
    canActivate: [AuthGuardGuard]
  },
  {
    path: 'boveda/reportes',
    component: ReportesComponent,
    canActivate: [AuthGuardGuard]
  },
  {
    path: 'boveda/crontab',
    component: CrontabComponent,
    canActivate: [AuthGuardGuard]
  }
];

@NgModule({
  imports: [
    AuthorizationComponent,
    ReportesComponent,
    CrontabComponent,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CoreCommonModule,
    CoreCardModule,
    NgxDatatableModule,
    NgbModule
  ]
})
export class BovedaModule { }
