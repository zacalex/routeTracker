import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routerTransition } from '../../../../router.animations';
import { switchTableService } from './../../../Service/switchTable.service';
import { nxapiService } from './../../../Service/nxapi.service';
import { ElasticsearchService } from './../../../Service/elasticsearch.service';
import { localBackendService} from '../../../Service/localBackend.service';
// import {bodybuilder} from 'bodybuilder'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-route-tracker-result',
    templateUrl: './routeTrackerResult.component.html',
    styleUrls: ['./routeTrackerResult.component.scss'],
    animations: [routerTransition()]
})
export class RouteTrackerResultComponent implements OnInit {

    ipVer = 'none';
    rpmName = 'routeTracker';
    ESresult = [];
    switchLogs = [];
    public isCollapsed = false;
    constructor(private st: switchTableService,
        private es: ElasticsearchService,
        private lb: localBackendService) {
    }
    data = {};
    latestAction = [];
    emptyResult = {
        '_source' : {
            af : 'NaN',
            event : 'NaN',
            nh_address : 'NaN',
            nh_count : 'NaN',
            nh_index : 'NaN',
            nh_metric : 'NaN',
            nh_outintf  : 'NaN',
            nh_preference  : 'NaN',
            nh_segmentid : 'NaN',
            nh_tag:  'NaN',
            nh_tunnelid  : 'NaN',
            nh_vrfname : 'NaN',
            owner  : 'NaN',
            path : 'NaN',
            prefix : 'NaN',
            swname  : 'NaN',
            time : 'NaN',
            timestamp :  'NaN',
            vrfname  :  'NaN'
        }};
    ngOnInit() {
    }
    onSearch(prefix, owner, vrfname) {
        this.ESresult = [];
        this.latestAction = [];
        const switches = this.st.getSwitchData();
        for (const i in switches) {
            if (switches.length <= i) {
                continue;
            }
            const switchname = switches[i].nickname;
            const data = {
                index: 'routetracker_tm_vrf_stats_' + switchname + '*',
                body: {
                    'query': {
                        'bool': {
                            'filter': []
                        }
                    },
                    'sort': {
                        'timestamp': {
                            'order': 'desc'
                        }
                    }

                }
            };
            // data.body['query']['bool']['filter'].push({'term': {'swname': switchname}});
            data.body['query']['bool']['filter'].push({'term': {'prefix': prefix.value.replace('/', '_')}});
            if (owner.value !== '') {
                data.body['query']['bool']['filter'].push({'term': {'owner': owner.value}});
            }
            if (vrfname.value !== '') {
                console.log(vrfname.value);
                data.body['query']['bool']['filter'].push({'term': {'vrfname': vrfname.value}});
            }
            console.log(data);
            this.searchForSearch(switches[i], data);

        }
    }

    searchForSearch(switchDetail, data) {
        const self = this;
        this.es.search(data).then(function(resp) {
            console.log(resp);
            const switchInfo = {};
            switchInfo['switch'] = switchDetail;
            switchInfo['logs'] = resp.hits.hits;
            if (switchInfo['logs'].length === 0) {
                switchInfo['logs'].push(self.emptyResult);
            }
            self.ESresult.unshift(switchInfo);
            self.latestAction.unshift({
                switch: switchDetail,
                data: resp.hits.hits[0]
            });

            console.log(self.latestAction);
        }, function(err) {
            console.log(err.message);
        });

    }

}
