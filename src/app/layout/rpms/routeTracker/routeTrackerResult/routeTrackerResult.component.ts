import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routerTransition } from '../../../../router.animations';
import { switchTableService } from './../../../Service/switchTable.service'
import { nxapiService } from './../../../Service/nxapi.service'
import { ElasticsearchService } from './../../../Service/elasticsearch.service'
// import {bodybuilder} from 'bodybuilder'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-routeTrackerResult',
    templateUrl: './routeTrackerResult.component.html',
    styleUrls: ['./routeTrackerResult.component.scss'],
    animations: [routerTransition()]
})
export class RouteTrackerResultComponent implements OnInit {

    ipVer = "none"
    rpmName = "routeTracker"
    ESresult = []
    switchLogs = []
    public isCollapsed = false;
    constructor(private st: switchTableService,
        private es: ElasticsearchService) {
    }
    data = {}
    ngOnInit() {

        // setInterval(() => {
        //
        //     this.data = {
        //         index: 'routetracker_tm_vrf_stats_*',
        //         body: {
        //
        //               "query": {
        //                   "bool": {
        //                       "filter": [
        //                           { "term": { "swname": "n9k" } },
        //                           { "term": { "prefix": "10.1.1.2" } }
        //                       ]
        //                   }
        //               }
        //
        //       }
        //     }
        //     this.searchForSearch(this.data)
        //
        //
        // }, 1000);
    }
    onSearch(prefix, owner, vrfname) {
        this.ESresult = []
        var switches = this.st.getSwitchData()
        for(var i in switches){
          var switchname = switches[i].nickname.split(/[.\-_]/)[0]
          var data = {
              index: 'routetracker_tm_vrf_stats_*',
              body: {
                  "query": {
                      "bool": {
                          "filter": [
                              { "term": { "swname": switchname } },
                              { "term": { "prefix": prefix.value } }
                          ]
                      }
                  }

              }
          }
          if(owner.value != ""){
            console.log(owner.value)
            data.body["query"]["bool"]["filter"].push({ "term": { "owner": owner.value } })
          }
          if(vrfname.value != ""){
            console.log(vrfname.value)
            data.body["query"]["bool"]["filter"].push({ "term": { "vrfname": vrfname.value } })
          }
          console.log(data)
          this.searchForSearch(switches[i].nickname,data)
        }
    }

    searchForSearch(name, data) {
        let self = this;
        this.es.search(data).then(function(resp) {
            console.log(resp)
            var switchInfo = {}
            switchInfo["switchName"] = name
            switchInfo["logs"] = resp.hits.hits
            self.ESresult.unshift(switchInfo)
            // console.log(self.ESresult)

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
