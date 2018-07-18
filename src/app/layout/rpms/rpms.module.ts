import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RpmsRoutingModule} from './rpms-routing.module';
import {RpmsComponent} from './rpms.component';
import {PageHeaderModule} from './../../shared';
import {MatButtonModule, MatCheckboxModule, MatTabsModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {SideTableModule} from './../components/sideTable/sideTable.module';
import {RouteTrackerComponent} from './routeTracker/routeTracker.component';
import {RouteTrackerResultComponent} from './routeTracker/routeTrackerResult/routeTrackerResult.component';
import {ChartsComponent} from './routeTracker/charts/charts.component';
import {ElasticsearchService} from './../Service/elasticsearch.service';
import {nxapiService} from './../Service/nxapi.service';
import {localBackendService} from './../Service/localBackend.service';

// import {  QueryBuilder} from 'bodybuilder'

@NgModule({
    imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SideTableModule,
        Ng2SmartTableModule,
        HttpClientModule,
        NgbModule.forRoot(),
        MatTabsModule,
        RpmsRoutingModule,
        PageHeaderModule,
        MatButtonModule,
        MatCheckboxModule],
    declarations: [RpmsComponent,
        RouteTrackerComponent,
        RouteTrackerResultComponent,
        ChartsComponent],
    providers: [ElasticsearchService, nxapiService, localBackendService]
})
export class RpmsModule {
}
