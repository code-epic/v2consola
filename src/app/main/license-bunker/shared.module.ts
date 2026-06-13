// shared.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LicenseBunkerComponent } from './license-bunker.component';

@NgModule({
  imports: [CommonModule, LicenseBunkerComponent],
  exports: [LicenseBunkerComponent]
})
export class SharedModule { }