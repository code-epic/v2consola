
import { Router } from '@angular/router';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild, DOCUMENT } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';
import { SearchService } from 'app/layout/components/navbar/navbar-search/search.service';

@Component({
    selector: 'app-navbar-search',
    templateUrl: './navbar-search.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, CoreCommonModule]
})
export class NavbarSearchComponent implements OnInit {
  // Public
  searchTextCtrl = new FormControl('');
  public searchText = '';
  public openSearchRef = false;
  public activeIndex = 0;
  public apiData;
  public pages = [];
  public files = [];
  public contacts = [];
  public pageSearchLimit;

  // Decorators
  @ViewChild('openSearch') private _inputElement: ElementRef;
  @ViewChild('pageList') private _pageListElement: ElementRef;

  @HostListener('keydown.escape') fn() {
    this.removeOverlay();
    this.openSearchRef = false;
    this.searchTextCtrl.setValue('');
  }
  @HostListener('document:click', ['$event']) clickout(event) {
    if (event.target.className === 'content-overlay') {
      this.removeOverlay();
      this.openSearchRef = false;
      this.searchTextCtrl.setValue('');
    }
  }

  /**
   *
   * @param document
   * @param router
   * @param _searchService
   */
  constructor(
    @Inject(DOCUMENT) private document,
    private _elementRef: ElementRef,
    private router: Router,
    public _searchService: SearchService
  ) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Next Active Match
   */
  nextActiveMatch() {
    this.activeIndex = this.activeIndex < this.pageSearchLimit - 1 ? ++this.activeIndex : this.activeIndex;
  }

  /**
   * Previous Active Match
   */
  prevActiveMatch() {
    this.activeIndex = this.activeIndex > 0 ? --this.activeIndex : 0;
  }

  /**
   * Remove Overlay
   */
  removeOverlay() {
    this.document.querySelector('.app-content').classList.remove('show-overlay');
  }

  /**
   * Auto Suggestion
   *
   * @param event
   */
  autoSuggestion(event) {
    if (38 === event.keyCode) {
      return this.prevActiveMatch();
    }
    if (40 === event.keyCode) {
      return this.nextActiveMatch();
    }
    if (13 === event.keyCode) {
      // Navigate to activeIndex
      // ! Todo: Improve this code
      let current_item = this._pageListElement.nativeElement.getElementsByClassName('current_item');
      current_item[0]?.children[0].click();
    }
  }

  /**
   * Toggle Search
   */
  toggleSearch() {
    this._searchService.onIsBookmarkOpenChange.next(false);
    this.removeOverlay();
    this.openSearchRef = !this.openSearchRef;
    this.activeIndex = 0;
    setTimeout(() => {
      this._inputElement.nativeElement.focus();
    });

    if (this.openSearchRef === false) {
      this.document.querySelector('.app-content').classList.remove('show-overlay');
      this.searchTextCtrl.setValue('');
    }
  }

  /**
   * Search Update
   *
   * @param event
   */
  searchUpdate(event) {
    const val = event.target.value.toLowerCase();
    if (val !== '') {
      this.document.querySelector('.app-content').classList.add('show-overlay');
    } else {
      this.document.querySelector('.app-content').classList.remove('show-overlay');
    }
    this.autoSuggestion(event);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // this._searchService.onApiDataChange.subscribe(res => {
    //   this.apiData = res;
    //   this.pages = this.apiData[0].data;
    //   this.pageSearchLimit = this.apiData[0].searchLimit;
    //   this.files = this.apiData[1].data;
    //   this.contacts = this.apiData[2].data;
    // });
  }
}
