import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreCommonModule } from '@core/common.module';

import { AuthLoginV1Component } from './auth-login-v1/auth-login-v1.component';
import { environment } from 'environments/environment';
import { AuthRegisterV1Component } from './auth-register-v1/auth-register-v1.component';
import { AuthResetPasswordV1Component } from './auth-reset-password-v1/auth-reset-password-v1.component';
import { AuthForgotPasswordV1Component } from './auth-forgot-password-v1/auth-forgot-password-v1.component';
import { AsistenteVirtualComponent } from 'app/main/asistente-virtual/asistente-virtual.component';

// routing
const routes: Routes = [

  {
    path: '',
    component: AuthLoginV1Component,
  },
  {
    path: 'login',
    component: AuthLoginV1Component,
  },
  {
    path: 'authentication/register-v1',
    component: AuthRegisterV1Component
  },
  {
    path: 'authentication/reset-password-v1',
    component: AuthResetPasswordV1Component
  },
  {
    path: 'authentication/forgot-password-v1',
    component: AuthForgotPasswordV1Component
  }
];

@NgModule({
  declarations: [
    AuthLoginV1Component,
    AuthRegisterV1Component,
    AuthResetPasswordV1Component,
    AuthForgotPasswordV1Component,
    AsistenteVirtualComponent
  ],
  imports: [CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CoreCommonModule,
  ]
})
export class AuthenticationModule {}
