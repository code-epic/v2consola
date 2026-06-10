import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CoreCardModule } from '@core/components/core-card/core-card.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ChatroomComponent } from './chatroom/chatroom.component';
import { MonitoreoComponent } from './monitoreo/monitoreo.component';
import { IncidenciasComponent } from './incidencias/incidencias.component';

const routes: Routes = [
  {
    path: 'soporte/chatroom',
    component: ChatroomComponent,
    canActivate: [AuthGuardGuard]
  },
  {
    path: 'soporte/monitoreo',
    component: MonitoreoComponent,
    canActivate: [AuthGuardGuard]
  },
  {
    path: 'soporte/incidencias',
    component: IncidenciasComponent,
    canActivate: [AuthGuardGuard]
  }
];

@NgModule({
  declarations: [
    ChatroomComponent,
    MonitoreoComponent,
    IncidenciasComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CoreCommonModule,
    ContentHeaderModule,
    CoreCardModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ]
})
export class SoporteModule { }
