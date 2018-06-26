import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { sideTableComponent } from './../components/sideTable/sideTable.component';

import { ElasticsearchService } from './../Service/elasticsearch.service';
import {localBackendService} from './../Service/localBackend.service';
import {nxapiService} from './../Service/nxapi.service';
import { switchTableService } from './../Service/switchTable.service';


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [routerTransition()]
})
export class FormComponent implements OnInit {
    public isCollapsed = false;
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    url = 'http://localhost:3000/switches/';
    urlServer = 'http://localhost:3001/';

    checkedSwitch = [];
    errorsLog = [];
    currentRpm = {};


    TabLogs = [];
    TabRpmReports = [];
    status = 'waiting';
    constructor(private http: HttpClient,
                private lb: localBackendService,
                private es: ElasticsearchService,
                private nxapi: nxapiService,
                private st: switchTableService) { }

    ngOnInit() {
        setInterval(() => {
            this.getRpmReport();

        }, 10000);

    }
    getRpmReport() {
        const switchList = this.st.getSwitchData();
        for (const i in switchList ) {
            // const swname = switchList[i].nickname.split('-')[0];
            const swname = switchList[i].nickname;
            const data = {
                index: 'rpm_stats_' + swname + '*',
                body: {
                    'query': {
                        'exists': {
                            'field' : 'package_id'
                        }

                    }
                    , 'sort': [
                        {
                            'timestamp': {
                                'order': 'asc'
                            }
                        }
                    ]
                    ,
                    'size': 1000
                }

            };
            console.log(data);
            this.searchForRpm(switchList[i], data);
        }
    }

    searchForRpm(switchDetail, query) {
        const self = this;
        let flag = true;
        this.es.search(query).then(function(resp) {
            console.log(resp.hits.hits);
            const rpmMap = {};
            const rpmList = [];
            resp.hits.hits.forEach(function (ele) {
                rpmMap[ele._source.package_id] = ele._source.status;
            });
            for (const key in rpmMap) {
                if(rpmMap[key] != 'removed')
                rpmList.push({
                    'package_id' : key,
                    'status' : rpmMap[key]
                });
            }
            rpmList.sort(function (a, b) {
                if (a.status !== b.status) {
                    if (a.status === 'active') {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    return a.package_id.localeCompare(b.package_id);
                }
            });
            for (const i in self.TabRpmReports) {
                if (self.TabRpmReports[i].switch.ip === switchDetail.ip) {

                    self.TabRpmReports[i].rpms = rpmList;
                    flag = false;
                }
            }
            if (flag) { self.TabRpmReports.unshift({
                'switch' : switchDetail,
                rpms : rpmList
            });
            }
            let i = self.lb.rpmStatus.length;
            while (i--) {
                if (self.lb.rpmStatus[i].ip == switchDetail.ip) {
                    for (const j in rpmList) {
                        if (i >= self.lb.rpmStatus.length || i < 0) { break; }
                        if (self.lb.rpmStatus[i].rpm == rpmList[j].package_id) {

                            if (self.lb.rpmStatus[i].status == 'Copying Success') {
                                if (rpmList[j].status === 'inactive') {
                                    self.lb.rpmStatus[i].status = 'Activating';
                                } else if (rpmList[j].status === 'active') {
                                    self.lb.rpmStatus.splice(i, 1);
                                     }
                            } else if (self.lb.rpmStatus[i].status == 'Deactivating Success' || self.lb.rpmStatus[i].status == 'Deactivating') {
                                if (rpmList[j].status === 'inactive') {
                                    self.lb.rpmStatus.splice(i, 1);

                                }
                            } else if (self.lb.rpmStatus[i].status == 'Activating Success' || self.lb.rpmStatus[i].status == 'Activating') {
                                if (rpmList[j].status === 'active') {
                                    self.lb.rpmStatus.splice(i, 1);
                                }

                            }

                        }
                    }
                }
            }



        }, function(err) {
            console.log(err.message);
        });
    }

    onAdd(address) {
        this.clearInstalled();
        console.log(address);
        console.log('here to send copy info to nodejs backend');
        // console.log(addressInput);
        const paths = address.split('/');
        const rpmName = paths[paths.length - 1];
        console.log(rpmName);
        const appName = rpmName.split('.rpm')[0];
        console.log(appName);
        this.currentRpm = {

            path: address,
            package: rpmName,
            appName: appName
        };

        const obj = {
            'address': address
        };


        obj['switches'] = this.st.getSwitchData();

        for (const i in obj['switches']) {
                    const status = {
                        ip: obj['switches'][i].ip,
                        rpm: appName,
                        status: 'Copying'
                    };
                    this.lb.pushTabrpmStatus(status);
                }



        this.postJsonToLocalBackend(obj, this.urlServer + 'copy')
            .subscribe(
                data => {
                    console.log(data);
                    this.addInstall();
                },
                error => {
                    this.errorsLog.push(error);
                    console.log(error);
                }
            );
    }
    clearInstalled() {
        let i = this.lb.rpmStatus.length;
        while (i--) {
            if (this.lb.rpmStatus[i].status.includes('Success')) {
                this.lb.rpmStatus.splice(i, 1);
            }
        }

    }
    pushTabrpmStatus(data) {
        this.lb.rpmStatus.unshift(data);
    }

    postJsonToLocalBackend(obj, url) {
        console.log('here to do the post');
        const parameter = JSON.stringify(obj);
        console.log(parameter);
        // console.log(url)
        return this.http.post(url, parameter, this.httpOptions);

    }
    addInstall() {
        console.log('here to add and install rpm');

        const version = '1.0';
        const type = 'cli_conf';
        const cli = 'install add bootflash:' + this.currentRpm['package'] + ' ;' + 'install activate ' + this.currentRpm['appName'];

        this.nxapi.runCli(cli, version, type, this.st.getSwitchData(), this.currentRpm['appName']);

    }



    deactiveRemove(rpmName, ip) {
        console.log('here to remove and deactive rpm');
        console.log(rpmName);
        console.log(ip);
        const version = '1.0';
        const type = 'cli_conf';
        // rpmName = rpmName.slice(0, -1);
        const cli = 'install deactivate ' + rpmName;
        this.lb.TabRpmReports = [];
        this.lb.status = 'Deactivating';
        this.nxapi.runCli(cli, version, type, this.st.getSwitchData(), rpmName);
        const status = {
            ip: ip,
            rpm: rpmName,
            status: 'Deactivating'
        };
        this.lb.pushTabrpmStatus(status);
        this.clearInstalled();
    }
    onActive(switchInfo, rpmName , ip) {
      console.log('here to add and install rpm');
      console.log(rpmName);
      console.log(ip);
      this.lb.TabRpmReports = [];
      this.lb.status = 'Activating';
      const version = '1.0';
      const type = 'cli_conf';
      // rpmName = rpmName.slice(0, -1);
      const cli = 'install activate ' + rpmName;
      this.nxapi.runCli(cli, version, type, [switchInfo], rpmName);
        const status = {
            ip: ip,
            rpm: rpmName,
            status: 'Activating'
        };
        this.lb.pushTabrpmStatus(status);
        this.clearInstalled();
    }

    onRemove(switchInfo, rpmName , ip) {
        console.log('here to remove rpm');
        console.log(rpmName);
        console.log(ip);
        this.lb.TabRpmReports = [];
        this.lb.status = 'activating';
        const version = '1.0';
        const type = 'cli_conf';
        // rpmName = rpmName.slice(0, -1);
        const cli = 'install remove ' + rpmName + '.rpm forced';
        this.nxapi.runCli(cli, version, type, [switchInfo], rpmName);
        const status = {
            ip: ip,
            rpm: rpmName,
            status: 'removing'
        };
        this.lb.pushTabrpmStatus(status);
        this.clearInstalled();
    }



}
