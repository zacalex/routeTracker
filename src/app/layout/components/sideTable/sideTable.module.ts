import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { sideTableComponent } from './sideTable.component';
import { HttpClientModule } from '@angular/common/http';
import {Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    imports: [CommonModule, HttpClientModule,Ng2SmartTableModule],
    declarations: [sideTableComponent],
    exports:[sideTableComponent]
})
export class SideTableModule {}
