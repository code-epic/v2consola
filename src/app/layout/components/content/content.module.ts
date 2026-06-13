import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';

import { ContentComponent } from 'app/layout/components/content/content.component';

@NgModule({
  imports: [RouterModule, CoreCommonModule, ContentComponent],
  exports: [ContentComponent]
})
export class ContentModule {}
