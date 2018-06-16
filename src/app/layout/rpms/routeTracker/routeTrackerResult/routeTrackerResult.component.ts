import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routerTransition } from '../../../../router.animations';
import { switchTableService } from './../../../Service/switchTable.service'
import { nxapiService } from './../../../Service/nxapi.service'
import { ElasticsearchService } from './../../../Service/elasticsearch.service'

@Component({
    selector: 'app-routeTrackerResult',
    templateUrl: './routeTrackerResult.component.html',
    styleUrls: ['./routeTrackerResult.component.scss'],
    animations: [routerTransition()]
})
export class RouteTrackerResultComponent implements OnInit {
    ipVer = "none"
    rpmName = "routeTracker"
    ESresult = [{
        key: "none",
        value: "none"
    }]
    switchLogs = []
    public isCollapsed = false;
    constructor(private st: switchTableService,
        private es: ElasticsearchService) {
    }
    data = {}
    ngOnInit() {

        setInterval(() => {

            this.data = {
                index: 'routetracker_tm_vrf_stats_*',
                body: {
                    query: {
                        "bool": {
                            "must": [
                                

                                {
                                    "match": {
                                        "prefix": '10.1.3.97/32'
                                    }
                                }
                            ]
                        }

                    }
                }
            }
            this.searchForSearch(this.data)


        }, 1000);
    }
    onSearch(prefix, owner, vrfname) {
        // this.data = {
        //   index :
        // }
    }

    searchForSearch(data) {
        let self = this;
        this.es.search(data).then(function(resp) {
            console.log(resp)
            // console.log(self.ESresult)
            // self.ESresult = []
            // if (resp.hits.hits[0]._source) {
            //     for (let key in resp.hits.hits[0]._source) {
            //         self.ESresult.push({
            //             key: key,
            //             value: resp.hits.hits[0]._source[key]
            //         })
            //     }
            // }


        }, function(err) {
            console.trace(err.message);
        });

    }

}
