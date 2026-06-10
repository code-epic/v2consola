import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CoreCardModule } from '@core/components/core-card/core-card.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbPaginationModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { LogsComponent } from './logs/logs.component';
import { BinnacleComponent } from './binnacle/binnacle.component';
import { BinnacleApplicationsComponent } from './binnacle-applications/binnacle-applications.component';
import { TrazaComponent } from './binnacle/traza/traza.component';
import { EventComponent } from './binnacle/events/events.component';
import { QueryLogComponent } from './query-log/query-log.component';
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
  {
    path: 'investigation/binnacle/traza/:id',
    component: TrazaComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'investigation/binnacle/events/:id',
    component: EventComponent,
    canActivate: [AuthGuardGuard],
  },
];

@NgModule({
  declarations: [
    LogsComponent,
    BinnacleComponent,
    QueryLogComponent,
    BinnacleApplicationsComponent,
    TrazaComponent,
    EventComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ContentHeaderModule,
    TranslateModule,
    FormsModule,
    CoreCardModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    CoreDirectivesModule,
    CorePipesModule,
    CoreSidebarModule,
    CoreCommonModule,
    CardSnippetModule,
    NgbPaginationModule,
    NgbNavModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class InvestigationModule { }
