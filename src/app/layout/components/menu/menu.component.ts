import { Component, ElementRef, Input, Renderer2, ViewEncapsulation } from '@angular/core';


import { VerticalMenuComponent } from 'app/layout/components/menu/vertical-menu/vertical-menu.component';
import { HorizontalMenuComponent } from 'app/layout/components/menu/horizontal-menu/horizontal-menu.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
    VerticalMenuComponent,
    HorizontalMenuComponent
]
})
export class MenuComponent {
  private _menuType: string;

  /**
   * Constructor
   *
   * @param {ElementRef} _elementRef
   * @param {Renderer2} _renderer
   */
  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    // Set the default menu
    this._menuType = 'vertical-menu';
  }

  // Accessors
  // -----------------------------------------------------------------------------------------------------

  //Get the menu type
  get menuType(): string {
    return this._menuType;
  }

  @Input()
  //Set the menu type to the native element
  set menuType(value: string) {
    // Remove the old class name from native element
    this._renderer.removeClass(this._elementRef.nativeElement, this.menuType);

    // Store the menuType value
    this._menuType = value;

    // Add the new class name from native element
    this._renderer.addClass(this._elementRef.nativeElement, value);
  }
}
