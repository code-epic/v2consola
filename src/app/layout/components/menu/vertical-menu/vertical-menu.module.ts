import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CoreMenuModule } from '@core/components';
import { CoreCommonModule } from '@core/common.module';

import { VerticalMenuComponent } from 'app/layout/components/menu/vertical-menu/vertical-menu.component';

@NgModule({
  declarations: [VerticalMenuComponent],
  imports: [CoreMenuModule, CoreCommonModule, RouterModule],
  exports: [VerticalMenuComponent]
})
export class VerticalMenuModule {}
