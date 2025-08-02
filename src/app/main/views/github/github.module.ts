import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

// GitHub Services
import { GitHubIssuesService } from '@services/github/github-issues.service';
import { ApplicationsService } from '@services/github/applications.service';
import { ErrorHandlerService } from '@services/github/error-handler.service';

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
  imports: [
    RouterModule.forChild(routes), 
    CommonModule, 
    FormsModule,
    ContentHeaderModule, 
    TranslateModule, 
    CoreCommonModule,
    NgSelectModule,
    NgxDatatableModule,
    NgbModule
  ],
  providers: [
    GitHubIssuesService,
    ApplicationsService,
    ErrorHandlerService
  ]
})
export class GithubModule { }
