import { NgModule } from '@angular/core';

import { CoreSidebarComponent } from '@core/components/core-sidebar/core-sidebar.component';

@NgModule({
  imports: [CoreSidebarComponent],
  exports: [CoreSidebarComponent]
})
export class CoreSidebarModule {}
