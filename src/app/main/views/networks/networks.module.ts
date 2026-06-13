import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { CoreCommonModule } from '@core/common.module';

import { CoreCardModule } from '@core/components/core-card/core-card.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { NgSelectModule } from '@ng-select/ng-select';


import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';


import { CommunicationsComponent } from './communications/communications.component';
import { ConnectionsComponent } from './connections/connections.component';

const routes = [
  {
    path: 'networks/communications',
    component: CommunicationsComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'networks/connections',
    component: ConnectionsComponent,
    canActivate: [AuthGuardGuard],
  },
];


@NgModule({
  imports: [
    CommunicationsComponent,
    ConnectionsComponent,
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    FormsModule,
    CoreCardModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgbModule,
    NgSelectModule,
    CoreDirectivesModule,
    CorePipesModule,
    CoreSidebarModule,
    CoreCommonModule
  ],
})
export class NetworksModule { }
