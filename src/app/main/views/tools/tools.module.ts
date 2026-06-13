import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';
import { FunctionsComponent } from './functions/functions.component';
import { ApiComponent } from './api/api-collection/api.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ApiListComponent } from './api/api-list/api-list.component';
import { ApiDetailsComponent } from './api/api-details/api-details.component';
import { RegisterApiComponent } from './api/register-api/register-api.component';
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
  imports: [
    RouterModule.forChild(routes),
    FunctionsComponent,
    ApiComponent,
    WorkflowComponent,
    ApiListComponent,
    ApiDetailsComponent,
    RegisterApiComponent,
    ApplicationsComponent,
  ],
})
export class ToolsModule { }
