import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BreadcrumbComponent } from 'app/layout/components/content-header/breadcrumb/breadcrumb.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild([]), BreadcrumbComponent],
  exports: [BreadcrumbComponent]
})
export class BreadcrumbModule {}
