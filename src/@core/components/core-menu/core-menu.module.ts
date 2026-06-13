import { NgModule } from '@angular/core';

import { CoreMenuComponent } from '@core/components/core-menu/core-menu.component';

import { CoreMenuVerticalSectionComponent } from '@core/components/core-menu/vertical/section/section.component';
import { CoreMenuVerticalItemComponent } from '@core/components/core-menu/vertical/item/item.component';
import { CoreMenuVerticalCollapsibleComponent } from '@core/components/core-menu/vertical/collapsible/collapsible.component';
import { CoreMenuHorizontalItemComponent } from '@core/components/core-menu/horizontal/item/item.component';
import { CoreMenuHorizontalCollapsibleComponent } from '@core/components/core-menu/horizontal/collapsible/collapsible.component';

@NgModule({
  imports: [
    CoreMenuComponent,
    CoreMenuVerticalSectionComponent,
    CoreMenuVerticalItemComponent,
    CoreMenuVerticalCollapsibleComponent,
    CoreMenuHorizontalItemComponent,
    CoreMenuHorizontalCollapsibleComponent
  ],
  exports: [CoreMenuComponent]
})
export class CoreMenuModule {}
