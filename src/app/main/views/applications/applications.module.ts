import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';
import { AuthGuard } from 'app/auth/helpers';

import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { CoreCardModule } from '@core/components/core-card/core-card.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { NgSelectModule } from '@ng-select/ng-select';

import { Ng2FlatpickrModule } from 'ng2-flatpickr';

import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { BlockUIModule } from 'ng-block-ui';



import { InstallComponent } from './install/install.component';
import { MenuComponent } from './menu/menu.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { EventsComponent } from './events/events.component';
import { ListComponent } from './list/list.component';


const routes = [
  {
    path: 'applications/list',
    component: ListComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/install',
    component: InstallComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/menu',
    component: MenuComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/monitoring',
    component: MonitoringComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/events',
    component: EventsComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  }
];


@NgModule({
  declarations: [
    InstallComponent,
    MenuComponent,
    MonitoringComponent,
    EventsComponent,
    ListComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ContentHeaderModule,
    TranslateModule,
    FormsModule,
    CoreCardModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    CoreDirectivesModule,
    BlockUIModule,
    CorePipesModule,
    CoreSidebarModule,
    CoreCommonModule
  ],
})
export class ApplicationsModule { }
