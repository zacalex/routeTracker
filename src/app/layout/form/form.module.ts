import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormRoutingModule } from './form-routing.module';
import { FormComponent } from './form.component';
import { PageHeaderModule } from './../../shared';
import {MatButtonModule, MatCheckboxModule,MatTabsModule} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { sideTableComponent } from './../components/sideTable/sideTable.component';
import {Ng2SmartTableModule } from 'ng2-smart-table';
import {SideTableModule} from './../components/sideTable/sideTable.module';


@NgModule({
    imports: [
      CommonModule,
      Ng2SmartTableModule,
      HttpClientModule,
      SideTableModule,
      NgbModule.forRoot(),
      MatTabsModule,FormRoutingModule, PageHeaderModule,MatButtonModule, MatCheckboxModule],
    declarations: [FormComponent]
})
export class FormModule {}
