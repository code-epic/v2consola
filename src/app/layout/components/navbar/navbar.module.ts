import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreCommonModule } from '@core/common.module';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';

import { NavbarComponent } from 'app/layout/components/navbar/navbar.component';
import { NavbarBookmarkComponent } from 'app/layout/components/navbar/navbar-bookmark/navbar-bookmark.component';
import { NavbarSearchComponent } from 'app/layout/components/navbar/navbar-search/navbar-search.component';

import { NavbarNotificationComponent } from 'app/layout/components/navbar/navbar-notification/navbar-notification.component';

@NgModule({
  imports: [RouterModule, NgbModule, CoreCommonModule, CoreTouchspinModule, NavbarSearchComponent, NavbarBookmarkComponent, NavbarNotificationComponent, NavbarComponent],
  exports: [NavbarComponent]
})
export class NavbarModule {}
