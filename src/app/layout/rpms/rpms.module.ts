import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpmsRoutingModule } from './rpms-routing.module';
import { RpmsComponent } from './rpms.component';
import { PageHeaderModule } from './../../shared';
import {MatButtonModule, MatCheckboxModule,MatTabsModule} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

import {Ng2SmartTableModule } from 'ng2-smart-table';
import {SideTableModule} from './../components/sideTable/sideTable.module';



@NgModule({
    imports: [CommonModule,SideTableModule,Ng2SmartTableModule, HttpClientModule,NgbModule.forRoot(),MatTabsModule,RpmsRoutingModule, PageHeaderModule,MatButtonModule, MatCheckboxModule],
    declarations: [RpmsComponent ]
})
export class RpmsModule {}
