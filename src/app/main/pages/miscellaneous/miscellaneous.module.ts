import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';

import { ErrorComponent } from './error/error.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LogoutComponent } from './logout/logout.component';


// routing
const routes: Routes = [
  {
    path: 'miscellaneous/error',
    component: ErrorComponent,
  },
  {
    path: 'miscellaneous/maintenance',
    component: MaintenanceComponent
  },
  {
    path: 'miscellaneous/not-authorized',
    component: NotAuthorizedComponent,
  },
  {
    path: 'miscellaneous/logout',
    component: LogoutComponent,
  },
];

@NgModule({
  declarations: [ErrorComponent, MaintenanceComponent, LogoutComponent],
  imports: [CommonModule, RouterModule.forChild(routes), CoreCommonModule]
})
export class MiscellaneousModule { }