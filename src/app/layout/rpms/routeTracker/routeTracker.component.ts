import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {routerTransition} from '../../../router.animations';
import {switchTableService} from './../../Service/switchTable.service';
import {nxapiService} from './../../Service/nxapi.service';
import {ElasticsearchService} from './../../Service/elasticsearch.service';
import {localBackendService} from '../../Service/localBackend.service';
import {chart} from 'highcharts';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-routeTracker',
    templateUrl: './routeTracker.component.html',
    styleUrls: ['./routeTracker.component.scss'],
    animations: [routerTransition()]
})
export class RouteTrackerComponent implements OnInit {
    ipVer = 'none';
    rpmName = 'routeTracker';
    watchInfo = [];
    public isCollapsed = false;
    // highcharts
    public chartHeight = 35;
    @ViewChild('chartTargetIp') chartTarget: ElementRef;
    chart: Highcharts.ChartObject;

    constructor(private st: switchTableService,
                private nxapi: nxapiService,
                private es: ElasticsearchService,
                private lb: localBackendService) {
    }

    ngOnInit() {
        setInterval(() => {
            this.getWatchReport();
            // console.log(this.chartTarget)
            this.getIpReport();
        }, 10000);
    }

    ipVerSelected(event) {
        console.log(event);
        this.ipVer = event.target.value;

    }

    getIpReport() {
        console.log('search ip report');
        const switchList = this.st.getSwitchData();
        for (const i in switchList) {
            // const swname = switchList[i].nickname.split('-')[0];
            const swname = switchList[i].nickname;
            const data = {
                index: 'routetracker_tm_vrf_stats_' + swname + '*',
                body: {
                    'query': {
                        'bool': {
                            'must':
                                {
                                    'exists': {
                                        'field': 'event'
                                    }
                                },
                            'filter': {
                                'range': {
                                    'timestamp': {
                                        'gte': 'now-2m',
                                        'lte': 'now'
                                    }
                                }
                            }
                        }
                    }
                    , 'size': 1000
                }

            };
            console.log(data);
            this.searchLastIpReport(switchList[i], data);
        }
    }

    searchLastIpReport(switchDetail, data) {
        const self = this;
        let latestTime;
        this.es.search(data).then(function (resp) {
            console.log(resp);


        }, function (err) {
            console.log(err.message);
        });
    }

    getWatchReport() {
        const switchList = this.st.getSwitchData();
        for (const i in switchList) {
            // const swname = switchList[i].nickname.split('-')[0];
            const swname = switchList[i].nickname;
            const data = {
                index: 'routetracker_watchdic_stats_' + swname + '*',
                body: {
                    'query': {
                        'constant_score': {
                            'filter': {
                                'bool': {
                                    'must': []
                                }
                            }
                        }
                    }
                    , 'size': 1,
                    'sort': [
                        {
                            'timestamp': {
                                'order': 'desc'
                            }
                        }
                    ]
                }

            };
            console.log(data);
            this.searchForLatestTime(switchList[i], data);
        }
    }

    searchForLatestTime(switchDetail, data) {
        const self = this;
        let latestTime;
        this.es.search(data).then(function (resp) {
            console.log(resp);
            if (resp.hits.hits.length == 0) {
                latestTime = 0;
            } else {
                latestTime = resp.hits.hits[0]._source.timestamp;
            }
            const swname = switchDetail.nickname;
            const query = {
                index: 'routetracker_watchdic_stats_' + swname + '*',
                body: {
                    'query': {
                        'constant_score': {
                            'filter': {
                                'bool': {
                                    'must': [
                                        {'term': {'timestamp': latestTime}}

                                    ]
                                }
                            }
                        }
                    },
                    'size': 1000


                }
            };
            self.searchForWatchDic(switchDetail, query);

        }, function (err) {
            console.log(err.message);
        });

    }

    searchForWatchDic(switchDetail, query) {
        const self = this;
        let flag = true;
        this.es.search(query).then(function (resp) {
            console.log(resp.hits.hits);
            resp.hits.hits.sort(function (a, b) {
                return a._source.protocol.localeCompare(b._source.protocol);
            });
            for (const i in resp.hits.hits) {
                if (resp.hits.hits[i]._source.af === 1) {
                    resp.hits.hits[i]._source['ipv'] = 'ipv6';
                } else if (resp.hits.hits[i]._source.af === 0) {
                    resp.hits.hits[i]._source['ipv'] = 'ipv4';
                } else {
                    resp.hits.hits[i]._source['ipv'] = '';
                }

                if (resp.hits.hits[i]._source.tag === 0) {
                    resp.hits.hits[i]._source.tag = '';
                }
            }
            for (const i in self.watchInfo) {
                if (self.watchInfo[i].switch.ip === switchDetail.ip) {

                    self.watchInfo[i].watchs = resp.hits.hits;
                    flag = false;
                }
            }
            if (flag) {
                self.watchInfo.unshift({
                    'switch': switchDetail,
                    watchs: resp.hits.hits
                });
            }

            console.log(self.watchInfo);

        }, function (err) {
            console.log(err.message);
        });
    }

    onWatch(protocol, tag, vrf) {
        // console.log(protocol)
        // console.log(tag)
        // console.log(this.ipVer)
        // console.log(vrf)
        const cli = this.constructRouteTrackerCli(protocol, tag, this.ipVer, vrf);
        console.log(cli);
        // console.log(this.st.get)
        // this.targetSwitch = this.switchTable.data
        this.nxapi.preRunCli(cli, this.st.getSwitchData(), this.rpmName);
        // this.nxapi.testCli();
    }

    onUnWatch(switchInfo, protocol, tag, vrf, af) {
        console.log(protocol);
        console.log(tag);
        console.log(this.ipVer);
        console.log(vrf);
        // let ip = '';
        // if (af === 1) { ip = 'ipv6'; } else if (af === 0) { ip = 'ipv4'; }
        const cli = 'no ' + this.constructRouteTrackerCli(protocol, tag, af, vrf);
        console.log(cli);
        // this.targetSwitch = this.switchTable.data
        this.nxapi.preRunCli(cli, [switchInfo], this.rpmName);
    }

    constructRouteTrackerCli(protocol, tag, ipVer, vrf) {
        let cli = this.rpmName + ' watch owner ' + protocol;
        if (tag.length > 0 && tag !== 0) {
            cli += ' ' + tag;
        }
        if (ipVer !== '' && ipVer !== 'none') {
            cli += ' ' + ipVer;
        }
        if (vrf.length > 0) {
            cli += ' vrf ' + vrf;
        }
        console.log(cli);
        return cli;
    }

    onStart() {
        const cli = 'nxsdk service-name ' + this.rpmName;
        console.log('start app' + this.rpmName);
        console.log(cli);
        this.nxapi.preRunCli(cli, this.st.getSwitchData(), this.rpmName);
    }

    onStop() {
        const cli = 'no nxsdk service-name ' + this.rpmName;
        console.log('start app' + this.rpmName);
        console.log(cli);
        this.nxapi.preRunCli(cli, this.st.getSwitchData(), this.rpmName);
    }



}
