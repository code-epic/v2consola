import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CoreMenuItem } from '@core/types';

@Component({
    selector: '[core-menu-vertical-item]',
    templateUrl: './item.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, CoreDirectivesModule]
})
export class CoreMenuVerticalItemComponent {
  @Input()
  item: CoreMenuItem;
}
