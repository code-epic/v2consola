import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { CoreMenuVerticalSectionComponent } from '@core/components/core-menu/vertical/section/section.component';
import { CoreMenuVerticalItemComponent } from '@core/components/core-menu/vertical/item/item.component';
import { CoreMenuVerticalCollapsibleComponent } from '@core/components/core-menu/vertical/collapsible/collapsible.component';
import { CoreMenuHorizontalItemComponent } from '@core/components/core-menu/horizontal/item/item.component';
import { CoreMenuHorizontalCollapsibleComponent } from '@core/components/core-menu/horizontal/collapsible/collapsible.component';

@Component({
    selector: '[core-menu]',
    templateUrl: './core-menu.component.html',
    styleUrls: ['./core-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CoreMenuVerticalSectionComponent,
        CoreMenuVerticalItemComponent,
        CoreMenuVerticalCollapsibleComponent,
        CoreMenuHorizontalItemComponent,
        CoreMenuHorizontalCollapsibleComponent
    ]
})
export class CoreMenuComponent implements OnInit {
  currentUser: any;

  @Input()
  layout = 'vertical';

  private _menu = signal<any>(undefined);

  @Input()
  set menu(value: any) {
    this._menu.set(value);
  }
  get menu() {
    return this._menu();
  }

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * @param {CoreMenuService} _coreMenuService
   */
  constructor(private _coreMenuService: CoreMenuService) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Set the menu either from the input or from the service
    this.menu = this.menu || this._coreMenuService.getCurrentMenu();

    // Subscribe to the current menu changes
    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {

      // Load menu
      this._menu.set(this._coreMenuService.getCurrentMenu());
    });
  }
}
