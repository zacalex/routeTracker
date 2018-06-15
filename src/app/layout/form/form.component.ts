import { Component, OnInit,ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { sideTableComponent } from './../components/sideTable/sideTable.component'

import { ElasticsearchService } from './../Service/elasticsearch.service'
import {localBackendService} from './../Service/localBackend.service'
import {nxapiService} from './../Service/nxapi.service'
import { switchTableService } from './../Service/switchTable.service'


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [routerTransition()]
})
export class FormComponent implements OnInit {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    url = 'http://localhost:3000/switches/';
    urlServer = 'http://localhost:3001/';

    checkedSwitch = []
    errorsLog = []
    currentRpm = {}
    rpmStatus = []

    TabLogs = []
    TabRpmReports = []
    status = "waiting"
    constructor(private http: HttpClient,
                private lb:localBackendService,
                private es: ElasticsearchService,
                private nxapi : nxapiService,
                private st: switchTableService) { }

    ngOnInit() {


    }
  
    onAdd(address) {
        console.log(address)
        console.log("here to send copy info to nodejs backend");
        // console.log(addressInput);
        var paths = address.split("/")
        var rpmName = paths[paths.length - 1]
        console.log(rpmName)
        var appName = rpmName.split("-")[0];
        console.log(appName)
        this.currentRpm = {

            path: address,
            package: rpmName,
            appName: appName
        }

        var obj = {
            "address": address
        };


        obj["switches"] = this.st.getSwitchData()

        for (var i in obj["switches"]) {
                    var status = {
                        ip: obj["switches"][i].ip,
                        rpm: appName,
                        status: "copying"
                    }
                    this.lb.pushTabrpmStatus(status)
                }

        this.postJsonToLocalBackend(obj, this.urlServer + 'copy')
            .subscribe(
                data => {
                    console.log(data);
                    this.addInstall()
                },
                error => {
                    this.errorsLog.push(error)
                    console.log(error)
                }
            );
    }


    postJsonToLocalBackend(obj, url) {
        console.log("here to do the post");
        var parameter = JSON.stringify(obj);
        console.log(parameter);
        // console.log(url)
        return this.http.post(url, parameter, this.httpOptions);

    }
    addInstall() {
        console.log("here to add and install rpm")

        var version = "1.0";
        var type = "cli_conf";
        var cli = "install add bootflash:" + this.currentRpm["package"] + " ;" + "install activate " + this.currentRpm["appName"]

        this.nxapi.runCli(cli, version, type,this.st.getSwitchData(),this.currentRpm["appName"])

    }

    checkRpms() {
        console.log("here to check rpms on the switches")
        if(this.st.getSwitchData().length >0) this.lb.status = "loading"
        else this.lb.status = "plase choose at least one switch"
        this.lb.TabRpmReports = []
        var version = "1.0";
        var type = "cli_show";
        var cli = "show install active ;show install inactive"

        this.nxapi.runCli(cli, version, type,this.st.getSwitchData(),this.currentRpm["appName"])

    }

    deactiveRemove(rpmName, ip) {
        console.log("here to remove and deactive rpm")
        console.log(rpmName)
        console.log(ip)
        var version = "1.0";
        var type = "cli_conf";
        rpmName = rpmName.slice(0, -1)
        var cli = "install deactivate " + rpmName
        this.lb.TabRpmReports = []
        this.lb.status = "deactivating"
        this.nxapi.runCli(cli, version, type,this.st.getSwitchData(),rpmName)

    }
    onActive(rpmName ,ip) {
      console.log("here to add and install rpm")
      console.log(rpmName)
      console.log(ip)
      this.lb.TabRpmReports = []
      this.lb.status = "activating"
      var version = "1.0";
      var type = "cli_conf";
      rpmName = rpmName.slice(0, -1)
      var cli = "install activate " + rpmName
      this.nxapi.runCli(cli, version, type,this.st.getSwitchData(),rpmName)
    }


    // runCli(cli, version, type) {
    //     console.log(cli)
    //     console.log(version)
    //     console.log(type)
    //     // console.log(rpm)
    //
    //     var payload = {
    //         "ins_api": {
    //
    //         }
    //     }
    //     // this.targetSwitch = this.switchDic
    //     payload["ins_api"]["version"] = version;
    //     payload["ins_api"]["type"] = type;
    //     payload["ins_api"]["chunk"] = "0";
    //     payload["ins_api"]["sid"] = "1";
    //     payload["ins_api"]["input"] = cli;
    //     payload["ins_api"]["output_format"] = "json"
    //
    //
    //     var info = {};
    //     info["switches"] = this.st.getSwitchData()
    //     info["payload"] = payload;
    //     info["rpmName"] = this.currentRpm["appName"]
    //
    //
    //     this.postJsonToLocalBackend(info, this.urlServer)
    //         .subscribe(
    //             data => {
    //                 console.log(data);
    //             }
    //         )
    // }

}
