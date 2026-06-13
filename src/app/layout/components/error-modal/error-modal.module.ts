import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalComponent } from './error-modal.component';
import { CoreCommonModule } from '@core/common.module';

@NgModule({
  imports: [
    CommonModule,
    CoreCommonModule,
    ErrorModalComponent
  ],
  exports: [ErrorModalComponent]
})
export class ErrorModalModule { }