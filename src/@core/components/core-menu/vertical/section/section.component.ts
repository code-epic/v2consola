import { Component, Input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CoreMenuItem } from '@core/types';

@Component({
    selector: '[core-menu-vertical-section]',
    templateUrl: './section.component.html',
    standalone: true,
    imports: [TranslateModule, CoreDirectivesModule]
})
export class CoreMenuVerticalSectionComponent {
  @Input()
  item: CoreMenuItem;
}
