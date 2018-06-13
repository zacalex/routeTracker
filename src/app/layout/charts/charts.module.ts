import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';

import { ChartsRoutingModule } from './charts-routing.module';
import { ChartsComponent } from './charts.component';
import { PageHeaderModule } from '../../shared';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, HttpClientModule,Ng2Charts, ChartsRoutingModule, PageHeaderModule],
    declarations: [ChartsComponent]
})
export class ChartsModule {}
