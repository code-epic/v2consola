import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoreMediaService {
  currentMediaQuery: string;
  onMediaUpdate: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Constructor
   *
   * @param {BreakpointObserver} _breakpointObserver
   */
  constructor(private _breakpointObserver: BreakpointObserver) {
    // Set the defaults
    this.currentMediaQuery = '';

    // Initialize
    this._init();
  }

  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Initialize
   *
   * @private
   */
  private _init(): void {
    // Observamos todos los breakpoints Bootstrap para detectar cambios
    this._breakpointObserver
      .observe([
        '(max-width: 575.98px)',
        '(min-width: 576px) and (max-width: 767.98px)',
        '(min-width: 768px) and (max-width: 991.98px)',
        '(min-width: 992px) and (max-width: 1199.98px)',
        '(min-width: 1200px)'
      ])
      .pipe(debounceTime(500))
      .subscribe((state: BreakpointState) => {
        if (state.breakpoints['(max-width: 575.98px)']) {
          this._emitChange('bs-xs');
        } else if (state.breakpoints['(min-width: 576px) and (max-width: 767.98px)']) {
          this._emitChange('bs-sm');
        } else if (state.breakpoints['(min-width: 768px) and (max-width: 991.98px)']) {
          this._emitChange('bs-md');
        } else if (state.breakpoints['(min-width: 992px) and (max-width: 1199.98px)']) {
          this._emitChange('bs-lg');
        } else if (state.breakpoints['(min-width: 1200px)']) {
          this._emitChange('bs-xl');
        }
      });
  }

  private _emitChange(alias: string): void {
    if (this.currentMediaQuery !== alias) {
      this.currentMediaQuery = alias;
      this.onMediaUpdate.next(alias);
    }
  }
}
