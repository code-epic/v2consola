import { NgModule } from '@angular/core';

import { MenuComponent } from 'app/layout/components/menu/menu.component';

@NgModule({
  imports: [MenuComponent],
  exports: [MenuComponent]
})
export class MenuModule {}
