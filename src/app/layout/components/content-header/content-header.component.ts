import { Component, OnInit, Input } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreDirectivesModule } from '@core/directives/directives';
import { BreadcrumbComponent } from 'app/layout/components/content-header/breadcrumb/breadcrumb.component';

// ContentHeader component interface
export interface ContentHeader {
  headerTitle: string;
  actionButton: boolean;
  breadcrumb?: {
    type?: string;
    links?: Array<{
      name?: string;
      isLink?: boolean;
      link?: string;
    }>;
  };
}

@Component({
    selector: 'app-content-header',
    templateUrl: './content-header.component.html',
    standalone: true,
    imports: [RouterModule, NgbModule, CoreDirectivesModule, BreadcrumbComponent]
})
export class ContentHeaderComponent implements OnInit {
  // input variable
  @Input() contentHeader: ContentHeader;

  constructor() {}

  ngOnInit() {}
}
