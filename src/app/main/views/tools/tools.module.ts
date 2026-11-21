import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

const routes: Routes = [
  {
    path: 'tools/functions',
    loadComponent: () =>
      import('./functions/functions.component').then((m) => m.FunctionsComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/:id',
    loadComponent: () =>
      import('./api/api-list/api-list.component').then((m) => m.ApiListComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications',
    loadComponent: () =>
      import('./applications/applications.component').then((m) => m.ApplicationsComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/api-list/:id',
    loadComponent: () =>
      import('./api/api-collection/api.component').then((m) => m.ApiComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/api-details/:id/:ruta',
    loadComponent: () =>
      import('./api/api-details/api-details.component').then((m) => m.ApiDetailsComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/workflow',
    loadComponent: () =>
      import('./workflow/workflow.component').then((m) => m.WorkflowComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/register-api/:id/:ruta',
    loadComponent: () =>
      import('./api/register-api/register-api.component').then((m) => m.RegisterApiComponent),
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'tools/applications/update-api/:id/:ruta',
    loadComponent: () =>
      import('./api/register-api/register-api.component').then((m) => m.RegisterApiComponent),
    canActivate: [AuthGuardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ToolsModule {}
