import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { InstallComponent } from './install/install.component';
import { MenuComponent } from './menu/menu.component';
import { ListComponent } from './list/list.component';
import { TerminalComponent } from './terminal/terminal.component';
import { ConciliationComponent } from './conciliation/conciliation.component';
import { TextMessagingComponent } from './text-messaging/text-messaging.component';


const routes = [
  {
    path: 'applications/list',
    component: ListComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/install',
    component: InstallComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/menu',
    component: MenuComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/terminal',
    component: TerminalComponent,
    // canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/conciliation',
    component: ConciliationComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'applications/sms',
    component: TextMessagingComponent,
    canActivate: [AuthGuardGuard],
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    ListComponent,
    InstallComponent,
    MenuComponent,
    ConciliationComponent,
    TerminalComponent,
    TextMessagingComponent
  ],
})
export class ApplicationsModule { }
