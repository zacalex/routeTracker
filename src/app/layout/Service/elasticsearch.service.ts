import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Client} from 'elasticsearch-browser';

@Injectable()
export class ElasticsearchService {

    private isDcnmVersion = true;
    // ES client
    private client: Client;

    // url parts to constructor dcnm ES
    private searchUrl = 'https://sjc-vinci-ucs14.cisco.com/afw/integrated/http_';
    private searchTail = '/dcnm-elasticsearch-api/Data%20Center';

    // standalone ES address
    private url = 'localhost:9200';

    //http header
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(private http: HttpClient) {
        this.connectToES();
    }

    // connect to ES depend on the version
    private connectToES(){
      if (this.isDcnmVersion) {
          this.AfwDiscoverService('dcnm-elasticsearch-api', '');
      } else {
          if (!this.client) {
              this.connectLocal();
          }
      }
    }

    // connect to local ES
    private connectLocal() {
        console.log('nomal connect ');
        this.client = new Client({
            // host: 'http://172.27.252.26:9200',
            host: this.url
        });
    }

    // ES search interface
    search(data) {
        // // const parameter = JSON.stringify(data);
        // // this.http.get()
        // return this.http.get(this.url, data).toP;
        if (!this.client) {
            this.connectToES();
        }
        return this.client.search(data);
    }

    // dervice discovery for Dcnm
    AfwDiscoverService(svc, fabric) {

        const x = {ServiceName: svc, PublishedPort: 0, PublicIP: '', error: 1, success: -1};
        const urlConstant = '/cors-proxy/cn1-cors-proxy?_target=http://localhost:35000/afw/service/';
        console.log('svc', svc, 'fabric', fabric);

        let fullUrl = urlConstant;
        if (fabric == '') {
            fullUrl = urlConstant + svc;
        } else {
            fullUrl = urlConstant + svc + '/' + fabric;
        }
        this.http.get(fullUrl).subscribe( res => {
            console.log('service discrover', res);
            if (!this.client) {
                this.connect(res['PublishedPort'].toString());
            }
        });

    }

    // connect to the DCNM ES after get the port from service discovery
    private connect(port) {

        this.client = new Client({
            // host: 'http://172.27.252.26:9200',
            host: this.searchUrl + port + this.searchTail
        });
    }




}
