import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routerTransition } from '../../../../router.animations';
import { switchTableService } from './../../../Service/switchTable.service'
import { nxapiService} from './../../../Service/nxapi.service'
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
    public isCollapsed = false;
    constructor(private st: switchTableService,
              private es: ElasticsearchService) {
    }

    ngOnInit() {
      let self = this;
       setInterval(() => {

          this.es.search({
              index: 'routetracker_stats_*',
              body: {
                  "size": 1,
                  "sort": {
                      "timestamp": {
                          "order": "desc"
                      }
                  }
              }
          }).then(function(resp) {
              // console.log(resp)
              // console.log(self.ESresult)
              self.ESresult = []
              if (resp.hits.hits[0]._source) {
                  for (let key in resp.hits.hits[0]._source) {
                      self.ESresult.push({
                          key: key,
                          value: resp.hits.hits[0]._source[key]
                      })
                  }
              }


          }, function(err) {
              console.trace(err.message);
          });
      }, 1000);
    }





}
