import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreDirectivesModule } from '@core/directives/directives';
import { CoreSidebarModule } from '@core/components/core-sidebar/core-sidebar.module';

import { CoreThemeCustomizerComponent } from '@core/components/theme-customizer/theme-customizer.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SystemInfoComponent } from '@core/components/system-info/system-info.component';
import { TaskMonitorComponent } from '../task-monitor/task-monitor.component';

@NgModule({
  declarations: [CoreThemeCustomizerComponent, SystemInfoComponent, TaskMonitorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    NgbNavModule
  ],
  exports: [CoreThemeCustomizerComponent]
})
export class CoreThemeCustomizerModule {}
