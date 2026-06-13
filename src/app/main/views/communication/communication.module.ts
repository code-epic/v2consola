import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthOnlyGuard } from '@services/seguridad/auth-only.guard';

import { ForumsComponent } from './forums/forums.component';

const routes: Routes = [
  {
    path: '',
    component: ForumsComponent,
    canActivate: [AuthOnlyGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ForumsComponent
  ]
})
export class CommunicationModule { }
