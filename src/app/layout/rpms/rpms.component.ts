import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';

import { sideTableComponent } from './../components/sideTable/sideTable.component'
// import { sideTableComponent } from './../components/sideTable/sideTable.component'
import { RouteTrackerComponent } from './routeTracker/routeTracker.component'
import { ElasticsearchService } from './../Service/elasticsearch.service'
import {localBackendService} from './../Service/localBackend.service'


@Component({
    selector: 'app-rpms',
    templateUrl: './rpms.component.html',
    styleUrls: ['./rpms.component.scss'],
    animations: [routerTransition()]
})
export class RpmsComponent implements OnInit {

    //ES
    public chartHeight = 35;
    @ViewChild('chartTarget') chartTarget: ElementRef;
    @ViewChild('switchTable') switchTable: sideTableComponent;
    //elasticsearch
    chart: Highcharts.ChartObject;

    //backendlogs


    // urlServer = 'http://localhost:3001/';


    ESresult = [{
        key: "none",
        value: "none"
    }]

    constructor(private lb:localBackendService,
        private es: ElasticsearchService) {

    }


    ngOnInit() {
        let self = this;

        // console.log(this.switchTable)

        // setInterval(() => {
        //     this.http.post(this.urlServer + "report", { "hello": "hello" })
        //         .subscribe(res => {
        //             // console.log(res);
        //
        //             this.processReport(res)
        //
        //         });
        //
        // }, 3000);

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
    // processReport(report) {
    //     // console.log(report)
    //     // console.log(report['report'].nxapi)
    //     // console.log(report['report'].rpms)
    //     if (report['report'].rpms.length > 0) {
    //         this.TabLogs.unshift(report['report'].rpms)
    //         console.log(this.TabLogs)
    //         for (var i in report['report'].rpms) {
    //             var currIp = report['report'].rpms[i].switchIp
    //             console.log(report['report'].rpms[i].rpmname)
    //             var paths = report['report'].rpms[i].rpmname.split("/")
    //             var currentRpm = paths[paths.length - 1].split("-")[0]
    //             console.log(currentRpm)
    //             for (var ind in this.rpmStatus) {
    //                 var st = this.rpmStatus[ind]
    //                 if (st.ip == currIp && st.rpm == currentRpm) {
    //                     console.log("found")
    //                     this.rpmStatus[ind].status = "installing"
    //                 }
    //             }
    //         }
    //     }
    //     if (report['report'].nxapi.length > 0) {
    //         this.TabLogs.unshift(report['report'].nxapi)
    //         console.log(this.TabLogs)
    //         var str = ""
    //         for (var i in report['report'].nxapi) {
    //             str += report['report'].nxapi[i]['result']
    //             if (!this.isJson(str)) {
    //                 continue
    //             }
    //             console.log(str)
    //             var rpmName = report['report'].nxapi[i]['rpmName']
    //             var ip = report['report'].nxapi[i]['ip']
    //             var nxapiObj = JSON.parse(str.replace(/[\n\r]/g, ' '))
    //             str = ""
    //             console.log(nxapiObj)
    //             if (nxapiObj.ins_api.type == 'cli_show') {
    //                 try {
    //                     var rpmReport = {}
    //                     rpmReport["ip"] = ip
    //                     if (nxapiObj.ins_api.outputs.output[0].body && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list
    //                         && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list) {
    //                         rpmReport["active"] = nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list
    //                         if (rpmReport["active"].constructor !== Array) {
    //                             rpmReport["active"] = [rpmReport["active"]]
    //                         }
    //                     }
    //                     if (nxapiObj.ins_api.outputs.output[1].body && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list
    //                         && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list) {
    //                         // console.log("inactive")
    //                         rpmReport["inactive"] = nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list
    //                         if (rpmReport["inactive"].constructor !== Array) {
    //                             rpmReport["inactive"] = [rpmReport["inactive"]]
    //                         }
    //                     }
    //                     this.TabRpmReports.unshift(rpmReport)
    //                     console.log(this.TabRpmReports)
    //                     this.status = "finished"
    //                 } catch (e) {
    //                     console.log(e)
    //                 }
    //
    //             }
    //             else if (nxapiObj.ins_api.outputs.output.length == 2 &&
    //                 (nxapiObj.ins_api.outputs.output[1].msg == 'Success'
    //                     || nxapiObj.ins_api.outputs.output[1].clierror.includes("already active")
    //                 )
    //             ) {
    //                 this.status = "get somethgin back, please click the tab to load."
    //                 console.log("installed")
    //                 for (var ind in this.rpmStatus) {
    //                     var st = this.rpmStatus[ind]
    //                     if (st.ip == ip && st.rpm == rpmName) {
    //                         console.log("found")
    //                         this.rpmStatus[ind].status = "installed"
    //                     }
    //                 }
    //             } else {
    //                 this.status = "get somethgin back, please click the tab to load."
    //             }
    //         }
    //     }
    //
    // }
    // isJson(str) {
    //     try {
    //         JSON.parse(str);
    //     } catch (e) {
    //         return false;
    //     }
    //     return true;
    // }



}
