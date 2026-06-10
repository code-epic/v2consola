import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { Location } from '@angular/common'; // Import Location service

import { takeUntil } from 'rxjs/operators'; // Keep takeUntil
import { Subject, timer } from 'rxjs'; // Import timer

import { CoreConfigService } from '@core/services/config.service';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
    standalone: false
})
export class ErrorComponent implements OnInit, OnDestroy { // Implement OnDestroy
  public coreConfig: any;
  public countdown: number = 10; // Initial countdown value
  private _timerSubscription: any; // To hold the timer subscription

  // Private
  private _unsubscribeAll: Subject<any>; // Keep for general subscriptions

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {Location} _location // Inject Location service
   */
  constructor(private _coreConfigService: CoreConfigService, private _location: Location) {
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    // Start the countdown timer
    this._timerSubscription = timer(0, 1000) // Emit value immediately, then every 1 second
      .pipe(takeUntil(this._unsubscribeAll)) // Ensure it unsubscribes when component is destroyed
      .subscribe(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.goBack(); // Redirect after countdown finishes
        }
      });
  }

  /**
   * Navigates back to the previous page.
   */
  goBack(): void {
    this._location.back();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions (including the timer)
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();

    // Explicitly unsubscribe from the timer if it's still active
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }
}
