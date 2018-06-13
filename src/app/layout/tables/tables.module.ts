import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';
import { TablesComponent } from './tables.component';
import { PageHeaderModule } from './../../shared';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';
@NgModule({
    imports: [CommonModule,
              TablesRoutingModule,
              HttpClientModule,
              FormsModule,
              PageHeaderModule],
    declarations: [TablesComponent]
})
export class TablesModule {}
