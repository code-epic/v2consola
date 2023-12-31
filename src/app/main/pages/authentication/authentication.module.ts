import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreCommonModule } from '@core/common.module';

import { AuthLoginV2Component } from './auth-login-v2/auth-login-v2.component';
import { AuthLoginV1Component } from './auth-login-v1/auth-login-v1.component';
import { environment } from 'environments/environment';

// routing
const routes: Routes = [
  {
    path: 'login2',
    component: AuthLoginV2Component,
  },
  {
    path: '',
    component: AuthLoginV1Component,
  },
  {
    path: 'login',
    component: AuthLoginV1Component,
  }
];

@NgModule({
  declarations: [AuthLoginV2Component,AuthLoginV1Component],
  imports: [CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CoreCommonModule]
})
export class AuthenticationModule {}
