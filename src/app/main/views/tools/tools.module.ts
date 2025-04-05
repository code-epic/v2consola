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
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { BlockUIModule } from 'ng-block-ui';
import { FunctionsComponent } from './functions/functions.component';
import { ApiComponent } from './api/api-collection/api.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ApiListComponent } from './api/api-list/api-list.component';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { ApiDetailsComponent } from './api/api-details/api-details.component';
import { RegisterApiComponent } from './api/register-api/register-api.component';
import { SqlFormatPipe } from '@core/pipes/sql-format.pipe';
import { ApplicationsComponent } from './applications/applications.component';

const routes = [
  {
    path: 'tools/functions',
    component: FunctionsComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/:id',
    component: ApiListComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications',
    component: ApplicationsComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/api-list/:id',
    component: ApiComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/api-details/:id/:ruta',
    component: ApiDetailsComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/workflow',
    component: WorkflowComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/register-api/:id/:ruta',
    component: RegisterApiComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/update-api/:id/:ruta',
    component: RegisterApiComponent,
    canActivate: [AuthGuardGuard],
  }
];

@NgModule({
  declarations: [
    FunctionsComponent,
    ApiComponent,
    WorkflowComponent,
    ApiListComponent,
    ApiDetailsComponent,
    RegisterApiComponent,
    SqlFormatPipe,
    ApplicationsComponent,
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
    CoreCommonModule,
    CardSnippetModule,
    CodemirrorModule,
    NgbPaginationModule
  ],
})
export class ToolsModule { }
