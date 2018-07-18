import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';


@Injectable()
export class nxapiService {

    dcnmUserName = 'root';
    dcnmpwd = 'Ciscolab123';

    private isOnDCNM = true;

    httpOptions = {
        headers: new HttpHeaders(
            {
                'Content-Type': 'application/json'
            })
    };
    authOptions = {
        headers: new HttpHeaders(
            {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            })
    };

    dcnmhttpOptions = {};
    urlServer = 'http://localhost:3001/';
    private nxapiUrl = 'https://sjc-vinci-ucs14.cisco.com/rest/epl/nx-api-invoke/';
    private authUrl = 'https://sjc-vinci-ucs14.cisco.com/fm/fmrest/dcnm/auth';
    dcnmToken = '';
    hostIp = '172.27.254.17';
    nxapiLogs = [];


    constructor(private http: HttpClient) {
        if (this.isOnDCNM){
            this.getDcnmToken();
        }

    }

    getDcnmToken() {
        const payload = {
            'j_username': this.dcnmUserName,
            'clientIp': this.hostIp,
            'j_password': this.dcnmpwd
        };
        let formBody = [];
        for (const property in payload) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(payload[property]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        const data = formBody.join('&');
        console.log(data);
        console.log('request for auth');
        this.http.post(this.authUrl, data, this.authOptions).subscribe(
            res => {
                console.log("in res",res);

            },
            err => {
                console.log("in err",err);
                this.dcnmToken = err.error.text;
                this.dcnmhttpOptions = {
                    headers: new HttpHeaders(
                        {
                            'Ddnm-Token': this.dcnmToken,
                            'Content-Type': 'application/json; charset=UTF-8'
                        })
                };
            }
        );
    }

    preRunCli(cli, switches, appName) {

        if (this.isOnDCNM){
            console.log("run cli through dcnm", cli);
            for (const i in switches) {
                const ip = switches[i].ip;
                console.log(ip, cli);
                this.runCliOnDcnm(ip, cli).subscribe(
                    res => {
                        console.log("res of nxapi",res);
                        this.nxapiLogs.push({
                            switchInfo: switches[i],
                            res: res
                        });
                    },
                    err => {
                        console.log("error of nxapi",err);

                        this.nxapiLogs.push({
                            switchInfo: switches[i],
                            res: err
                        });
                    }
                );
            }
        } else {
            console.log('run cli');

            let version = '1.0';
            let type = 'cli_conf';
//
            this.runCli(cli, version, type, switches, appName);
        }


    }


    runCli(cli, version, type, switches, appName) {
        console.log(cli);
        console.log(version);
        console.log(type);
        // console.log(rpm)

        let payload = {
            'ins_api': {}
        };
        // this.targetSwitch = this.switchDic
        payload['ins_api']['version'] = version;
        payload['ins_api']['type'] = type;
        payload['ins_api']['chunk'] = '0';
        payload['ins_api']['sid'] = '1';
        payload['ins_api']['input'] = cli;
        payload['ins_api']['output_format'] = 'json';


        let info = {};
        info['switches'] = switches;
        info['payload'] = payload;
        info['rpmName'] = appName;


        this.postJsonToLocalBackend(info, this.urlServer)
            .subscribe(
                data => {
                    console.log(data);
                }
            );
    }

    postJsonToLocalBackend(obj, url) {
        console.log('here to do the post');
        const parameter = JSON.stringify(obj);
        console.log(parameter);
        // console.log(url)
        return this.http.post(url, parameter, this.httpOptions);

    }

    runCliOnDcnm(ip, cli) {
        const payload = {
            'ip': ip,

            'cmd': cli
        };
        const parameter = JSON.stringify(payload);
        console.log(parameter);
        return this.http.post(this.nxapiUrl, parameter, this.dcnmhttpOptions);
    }

    testCli() {
        const payload = {
            'ip': '172.25.140.229',

            'cmd': 'show nxapi'
        };
        const parameter = JSON.stringify(payload);
        console.log(parameter);
        // console.log(url)


        this.http.post(this.nxapiUrl, parameter, this.dcnmhttpOptions).subscribe(
            res => {
                console.log("res of nxapi",res);
            },
            err => {
                console.log("error of nxapi",err);
            }
        );

    }

}
