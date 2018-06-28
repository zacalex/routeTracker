import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { chart } from 'highcharts';
import { ElasticsearchService } from './../Service/elasticsearch.service';
import {localBackendService} from './../Service/localBackend.service';


@Component({
    selector: 'app-rpms',
    templateUrl: './rpms.component.html',
    styleUrls: ['./rpms.component.scss'],
    animations: [routerTransition()]
})
export class RpmsComponent implements OnInit {

    constructor(private lb: localBackendService,
        private es: ElasticsearchService) {

    }


    ngOnInit() {
    }




}
