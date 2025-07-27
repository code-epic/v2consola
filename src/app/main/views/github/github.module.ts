import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { IssuesComponent } from './issues/issues.component';

const routes = [
  {
    path: 'github/issues',
    component: IssuesComponent,
    canActivate: [AuthGuardGuard],
  }
];

@NgModule({
  declarations: [
    IssuesComponent
  ],
  imports: [RouterModule.forChild(routes), CommonModule, ContentHeaderModule, TranslateModule, CoreCommonModule],
})
export class GithubModule { }
