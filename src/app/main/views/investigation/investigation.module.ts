import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

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
import { LogsComponent } from './logs/logs.component';
import { BinnacleComponent } from './binnacle/binnacle.component';
import { SystemLogComponent } from './system-log/system-log.component';
import { QueryLogComponent } from './query-log/query-log.component';
import { CacheLogComponent } from './cache-log/cache-log.component';
import { BinnacleApplicationsComponent } from './binnacle-applications/binnacle-applications.component';



const routes = [
  {
    path: 'investigation/logs',
    component: LogsComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'investigation/binnacle',
    component: BinnacleComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'investigation/binnacle/:id',
    component: BinnacleApplicationsComponent,
    canActivate: [AuthGuardGuard],
  },
];

@NgModule({
  declarations: [LogsComponent, BinnacleComponent, SystemLogComponent, QueryLogComponent, CacheLogComponent, BinnacleApplicationsComponent],
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
  ]
})
export class InvestigationModule { }
