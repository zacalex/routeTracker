import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.getConfig().subscribe(data => {
            console.log(data)
            this.switchDic = Object.values(data)
        });

        setInterval(() => {
            this.http.post(this.urlServer + "report", { "hello": "hello" })
                .subscribe(res => {
                    console.log(res);

                    this.processReport(res)

                });

        }, 3000);
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

        // this.targetSwitch = this.switchDic

        for (var i in this.targetSwitch) {
            var status = {
                ip: this.targetSwitch[i].ip,
                rpm: appName,
                status: "copying"
            }
            this.rpmStatus.push(status)
        }

        var obj = {
            "address": address
        };
        obj["switches"] = this.targetSwitch
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
    // onRemove(address) {
    //     console.log(address)
    //     console.log("here to send remove message to nodejs");
    //     // console.log(addressInput);
    //     var paths = address.split("/")
    //     var rpmName = paths[paths.length - 1]
    //     console.log(rpmName)
    //     var appName = rpmName.split("-")[0];
    //     console.log(appName)
    //     this.currentRpm = {
    //
    //         path: address,
    //         package: rpmName,
    //         appName: appName
    //     }
    //     // this.rpms.push(rpmObj);
    //     // console.log(this.rpms);
    //     // this.postJsonToLocalBackend(rpmObj,this.urlRpms)
    //     // this.deactiveRemove()
    // }

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

        this.runCli(cli, version, type)
    }

    checkRpms() {
        console.log("here to check rpms on the switches")
        if(this.targetSwitch.length >0) this.status = "loading"
        else this.status = "plase choose at least one switch"
        this.TabRpmReports = []
        var version = "1.0";
        var type = "cli_show";
        var cli = "show install active ;show install inactive"

        this.runCli(cli, version, type)
    }

    deactiveRemove(rpmName, ip) {
        console.log("here to remove and deactive rpm")
        console.log(rpmName)
        console.log(ip)
        var version = "1.0";
        var type = "cli_conf";
        rpmName = rpmName.slice(0, -1)
        var cli = "install deactivate " + rpmName
        this.TabRpmReports = []
        this.status = "deactivating"
        this.targetSwitch = []
        for(var i in this.switchDic){
          if(ip == this.switchDic[i].ip){
            this.targetSwitch.push(this.switchDic[i])
            break;
          }
        }

        this.runCli(cli, version, type)
    }
    onActive(rpmName ,ip) {
      console.log("here to add and install rpm")
      console.log(rpmName)
      console.log(ip)
      this.TabRpmReports = []
      this.status = "activating"
      var version = "1.0";
      var type = "cli_conf";
      rpmName = rpmName.slice(0, -1)
      var cli = "install activate " + rpmName

      this.targetSwitch = []
      for(var i in this.switchDic){
        if(ip == this.switchDic[i].ip){
          this.targetSwitch.push(this.switchDic[i])
          break;
        }
      }

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
    onCheckBoxChange(switchInfo) {

        console.log(this.status)
        this.TabRpmReports = []
        this.status = "please choose switches and cilick the tab"
        console.log(this.TabRpmReports)
        if (switchInfo.id in this.targetSwitchDic) {
            console.log("delete")
            delete this.targetSwitchDic[switchInfo.id]
        }
        else {
            console.log("add")
            this.targetSwitchDic[switchInfo.id] = switchInfo
        }

        this.targetSwitch = []
        for (var ind in this.targetSwitchDic) {
            this.targetSwitch.push(this.targetSwitchDic[ind])
        }
        console.log(this.targetSwitch)
    }

}
