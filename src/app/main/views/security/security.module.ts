import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuardGuard } from '@services/seguridad/auth-guard.guard';

import { RoleComponent } from './role/role.component';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { UserListComponent } from './user-list/user-list.component';
import { RuleComponent } from './rule/rule.component';

const routes = [
  {
    path: 'security/rules',
    component: RuleComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'security/role',
    component: RoleComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'security/profile',
    component: ProfileComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'security/user',
    component: UserComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'security/user/:id',
    component: UserComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'security/user-list',
    component: UserListComponent,
    canActivate: [AuthGuardGuard],
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    RoleComponent,
    ProfileComponent,
    UserComponent,
    UserListComponent,
    RuleComponent,
  ],
})
export class SecurityModule { }
