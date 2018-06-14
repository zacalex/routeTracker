import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';
import { Client } from 'elasticsearch-browser';
import { sideTableComponent } from './../components/sideTable/sideTable.component'
// import { sideTableComponent } from './../components/sideTable/sideTable.component'


@Component({
    selector: 'app-rpms',
    templateUrl: './rpms.component.html',
    styleUrls: ['./rpms.component.scss'],
    animations: [routerTransition()]
})
export class RpmsComponent implements OnInit {

    //ES
    public chartHeight=35;
    @ViewChild('chartTarget') chartTarget: ElementRef;
    @ViewChild('switchTable') switchTable: sideTableComponent;
    //elasticsearch
    chart: Highcharts.ChartObject;
    private client: Client;
    //backendlogs
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    url = 'http://localhost:3000/switches/';
    urlServer = 'http://localhost:3001/';
    switchDic = []
    checkedSwitch = []
    errorsLog = []
    currentRpm = {}
    rpmStatus = []
    targetSwitch = []
    targetSwitchDic = {}
    TabLogs = []
    TabRpmReports = []
    status = "waiting"
    ESresult = [{
      key:"none",
      value:"none"
    }]
    constructor(private http: HttpClient) {
      if (!this.client) {
          this.connect();
      }

     }

     private connect() {
         this.client = new Client({
             host: 'http://172.27.252.26:9200',
             log: 'trace'
         });
         this.client.ping({
             requestTimeout: Infinity,
             body: 'hello JavaSampleApproach!'
         }).then(function(resp) {
             console.log(resp);
         })
             .catch(function(err) {
                 console.log(err);
             });
     }

    ngOnInit() {
      let self=this;

        // console.log(this.switchTable)

        setInterval(() => {
            this.http.post(this.urlServer + "report", { "hello": "hello" })
                .subscribe(res => {
                    console.log(res);

                    this.processReport(res)

                });

        }, 3000);

        setInterval(() => {

            this.client.search({
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
                console.log(resp)
                console.log(self.ESresult)
                self.ESresult = []
                if(resp.hits.hits[0]._source){
                  for(let key in resp.hits.hits[0]._source){
                    self.ESresult.push({
                      key : key,
                      value : resp.hits.hits[0]._source[key]
                    })
                  }
                }


            }, function(err) {
                console.trace(err.message);
            });
        }, 1000);


    }
    processReport(report) {
        console.log(report)
        console.log(report['report'].nxapi)
        console.log(report['report'].rpms)
        if (report['report'].rpms.length > 0) {
            this.TabLogs.unshift(report['report'].rpms)
            console.log(this.TabLogs)
            for (var i in report['report'].rpms) {
                var currIp = report['report'].rpms[i].switchIp
                console.log(report['report'].rpms[i].rpmname)
                var paths = report['report'].rpms[i].rpmname.split("/")
                var currentRpm = paths[paths.length - 1].split("-")[0]
                console.log(currentRpm)
                for (var ind in this.rpmStatus) {
                    var st = this.rpmStatus[ind]
                    if (st.ip == currIp && st.rpm == currentRpm) {
                        console.log("found")
                        this.rpmStatus[ind].status = "installing"
                    }
                }
            }
        }
        if (report['report'].nxapi.length > 0) {
            this.TabLogs.unshift(report['report'].nxapi)
            console.log(this.TabLogs)
            var str = ""
            for (var i in report['report'].nxapi) {
                str += report['report'].nxapi[i]['result']
                if (!this.isJson(str)) {
                    continue
                }
                console.log(str)
                var rpmName = report['report'].nxapi[i]['rpmName']
                var ip = report['report'].nxapi[i]['ip']
                var nxapiObj = JSON.parse(str.replace(/[\n\r]/g, ' '))
                str = ""
                console.log(nxapiObj)
                if (nxapiObj.ins_api.type == 'cli_show') {
                    try {
                        var rpmReport = {}
                        rpmReport["ip"] = ip
                        if (nxapiObj.ins_api.outputs.output[0].body && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list
                            && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list) {
                            rpmReport["active"] = nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list
                            if(rpmReport["active"].constructor !== Array ) {
                              rpmReport["active"] = [rpmReport["active"]]
                            }
                        }
                        if (nxapiObj.ins_api.outputs.output[1].body && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list
                            && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list) {
                            // console.log("inactive")
                            rpmReport["inactive"] = nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list
                            if(rpmReport["inactive"].constructor !== Array ) {
                              rpmReport["inactive"] = [rpmReport["inactive"]]
                            }
                        }
                        this.TabRpmReports.unshift(rpmReport)
                        console.log(this.TabRpmReports)
                        this.status = "finished"
                    } catch (e) {
                        console.log(e)
                    }

                }
                else if (nxapiObj.ins_api.outputs.output.length == 2 &&
                    (nxapiObj.ins_api.outputs.output[1].msg == 'Success'
                        || nxapiObj.ins_api.outputs.output[1].clierror.includes("already active")
                    )
                ) {
                    this.status = "get somethgin back, please click the tab to load."
                    console.log("installed")
                    for (var ind in this.rpmStatus) {
                        var st = this.rpmStatus[ind]
                        if (st.ip == ip && st.rpm == rpmName) {
                            console.log("found")
                            this.rpmStatus[ind].status = "installed"
                        }
                    }
                } else {
                  this.status = "get somethgin back, please click the tab to load."
                }
            }
        }
        // if (report['nxapi'].length > 0 || report['rpms'].length > 0) {
        //     var nxapi_str = report['nxapi'][0].replace(/[\n\r]/g, ' ')
        //     // var rpms_str = report['rpms'][0].replace(/[\n\r]/g,' ')
        //     console.log(nxapi_str);
        //
        //     var str = ""
        //     for (let ind in report['nxapi']) {
        //         str += report['nxapi'][ind]
        //     }
        //     var nxapiObj = JSON.parse(str.replace(/[\n\r]/g, ' '))
        //     console.log(nxapiObj);
        //     this.ExecResult_label = nxapiObj
        //     var len = nxapiObj['ins_api']['outputs']['output'].length
        //     this.installActive = nxapiObj['ins_api']['outputs']['output'][len - 1]['body'].split("Packages:")[1].replace("\n", " ").split("\n")
        //     this.installInActive = nxapiObj['ins_api']['outputs']['output'][len - 2]['body'].split("Packages:")[1].replace("\n", " ").split("\n")
        //     // this.installActive = nxapiObj['ins_api']['outputs']['output'][len-1]['body']['TABLE_package_list']['ROW_package_list']
        //     // this.installInActive = nxapiObj['ins_api']['outputs']['output'][len-2]['body']['TABLE_package_list']['ROW_package_list']
        //     console.log(this.installActive)
        //     console.log(this.installInActive)
        // }
    }
    isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    getConfig() {
        return this.http.get(this.url);
    }
    ipVerSelected(event){
      console.log(event)
      this.ipVer = event.target.value
    }
    ipVer = "none"
    rpmName = "routeTracker"
    onWatch(protocol, tag, vrf){
      console.log(protocol)
      console.log(tag)
      console.log(this.ipVer)
      console.log(vrf)
      var cli = this.constructRouteTrackerCli(protocol,tag,this.ipVer,vrf)
      console.log(cli)
      this.targetSwitch = this.switchTable.data
      this.preRunCli(cli)
    }

    onUnWatch(protocol, tag, vrf){
      // console.log(protocol)
      // console.log(tag)
      // console.log(this.ipVer)
      // console.log(vrf)
      var cli = "no " + this.constructRouteTrackerCli(protocol,tag,this.ipVer,vrf)
      console.log(cli)
      this.targetSwitch = this.switchTable.data
      this.preRunCli(cli)
    }

    constructRouteTrackerCli(protocol,tag,ipVer,vrf){
      var cli = this.rpmName + " watch owner " + protocol
      if(tag.length > 0) cli += " " + tag
      if(ipVer != "none") cli += " " + ipVer
      if(vrf.length > 0) cli += " " + vrf
      console.log(cli)
      return cli
    }


    preRunCli(cli) {

        console.log("run cli")

        var version = "1.0";
        var type = "cli_conf";

        this.runCli(cli, version, type)
    }


    runCli(cli, version, type) {
        console.log(cli)
        console.log(version)
        console.log(type)
        // console.log(rpm)

        var payload = {
            "ins_api": {

            }
        }
        // this.targetSwitch = this.switchDic
        payload["ins_api"]["version"] = version;
        payload["ins_api"]["type"] = type;
        payload["ins_api"]["chunk"] = "0";
        payload["ins_api"]["sid"] = "1";
        payload["ins_api"]["input"] = cli;
        payload["ins_api"]["output_format"] = "json"


        var info = {};
        info["switches"] = this.targetSwitch;
        info["payload"] = payload;
        info["rpmName"] = this.currentRpm["appName"]


        this.postJsonToLocalBackend(info, this.urlServer)
            .subscribe(
                data => {
                    console.log(data);
                }
            )
    }

    postJsonToLocalBackend(obj, url) {
        console.log("here to do the post");
        var parameter = JSON.stringify(obj);
        console.log(parameter);
        // console.log(url)
        return this.http.post(url, parameter, this.httpOptions);

    }


}
