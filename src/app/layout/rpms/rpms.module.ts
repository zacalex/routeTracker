import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpmsRoutingModule } from './rpms-routing.module';
import { RpmsComponent } from './rpms.component';
import { PageHeaderModule } from './../../shared';
import {MatButtonModule, MatCheckboxModule,MatTabsModule} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
    imports: [CommonModule, HttpClientModule,NgbModule.forRoot(),MatTabsModule,RpmsRoutingModule, PageHeaderModule,MatButtonModule, MatCheckboxModule],
    declarations: [RpmsComponent]
})
export class RpmsModule {}
