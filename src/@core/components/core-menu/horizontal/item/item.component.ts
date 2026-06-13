import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreDirectivesModule } from '@core/directives/directives';

@Component({
    selector: '[core-menu-horizontal-item]',
    templateUrl: './item.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, CoreDirectivesModule]
})
export class CoreMenuHorizontalItemComponent {
  @Input()
  item: any;
}
