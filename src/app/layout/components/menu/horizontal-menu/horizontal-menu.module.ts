import { NgModule } from '@angular/core';

import { CoreMenuModule } from '@core/components';
import { CoreCommonModule } from '@core/common.module';

import { HorizontalMenuComponent } from 'app/layout/components/menu/horizontal-menu/horizontal-menu.component';

@NgModule({
  imports: [CoreMenuModule, CoreCommonModule, HorizontalMenuComponent],
  exports: [HorizontalMenuComponent]
})
export class HorizontalMenuModule {}
