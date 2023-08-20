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

import { FunctionsComponent } from './functions/functions.component';
import { ApiComponent } from './api/api.component';
import { WorkflowComponent } from './workflow/workflow.component';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';


const routes = [
  {
    path: 'tools/functions',
    component: FunctionsComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/api',
    component: ApiComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/workflow',
    component: WorkflowComponent,
    // canActivate: [AuthGuard,AuthGuardGuard],
    canActivate: [AuthGuardGuard],
  }
];

@NgModule({
  declarations: [
    FunctionsComponent,
    ApiComponent,
    WorkflowComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ContentHeaderModule,
    TranslateModule,
    FormsModule,
    CodemirrorModule,
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
export class ToolsModule { }
