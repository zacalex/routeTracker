import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';
import { Client } from 'elasticsearch-browser';

@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss'],
    animations: [routerTransition()]
})
export class ChartsComponent implements OnInit {

    //highcharts
    public chartHeight=35;

    @ViewChild('chartTarget') chartTarget: ElementRef;
    //elasticsearch

    chart: Highcharts.ChartObject;
    private client: Client;
    // bar chart


    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };

    public barChartLabels: string[] = [
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012'
    ];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;

    public barChartData: any[] = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ];

    // Doughnut
    public doughnutChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail-Order Sales'
    ];
    public doughnutChartData: number[] = [350, 450, 100];
    public doughnutChartType: string = 'doughnut';

    // Radar
    public radarChartLabels: string[] = [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running'
    ];
    public radarChartData: any = [
        { data: [65, 59, 90, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 96, 27, 100], label: 'Series B' }
    ];
    public radarChartType: string = 'radar';

    // Pie
    public pieChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail Sales'
    ];
    public pieChartData: number[] = [300, 500, 100];
    public pieChartType: string = 'pie';

    // PolarArea
    public polarAreaChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail Sales',
        'Telesales',
        'Corporate Sales'
    ];
    public polarAreaChartData: number[] = [300, 500, 100, 40, 120];
    public polarAreaLegend: boolean = true;

    public polarAreaChartType: string = 'polarArea';

    // lineChart
    public lineChartData: Array<any> = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
        { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
    ];
    public lineChartLabels: Array<any> = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July'
    ];
    public lineChartOptions: any = {
        responsive: true
    };
    public lineChartColors: Array<any> = [
        {
            // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        {
            // dark grey
            backgroundColor: 'rgba(77,83,96,0.2)',
            borderColor: 'rgba(77,83,96,1)',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        {
            // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';

    // events
    public chartClicked(e: any): void {
        // console.log(e);
    }

    public chartHovered(e: any): void {
        // console.log(e);
    }

    public randomize(): void {
        // Only Change 3 values
        const data = [
            Math.round(Math.random() * 100),
            59,
            80,
            Math.random() * 100,
            56,
            Math.random() * 100,
            40
        ];
        const clone = JSON.parse(JSON.stringify(this.barChartData));
        clone[0].data = data;
        this.barChartData = clone;
        /**
         * (My guess), for Angular to recognize the change in the dataset
         * it has to change the dataset variable directly,
         * so one way around it, is to clone the data, change it and then
         * assign it;
         */
    }

    constructor() {
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
        setInterval(() => {

            this.client.search({
                index: 'lan_info_stats_*',
                body: {
                    "size": 2,
                    "sort": {
                        "timestamp": {
                            "order": "desc"
                        }
                    }
                }
            }).then(function(resp) {
                var hits = resp.hits.hits;

                // console.log(hits.length);

                var x = (new Date()).getTime(), // current time
                    dropped = -1,
                    confirmed = -1;
                for (var i in hits) {
                    // console.log(hits[i]["_source"]["CoPP_dropped"]);
                    if (hits[i]["_source"]["CoPP_dropped"] != null && dropped == -1) dropped = hits[i]["_source"]["CoPP_dropped"]
                    if (hits[i]["_source"]["CoPP_conformed"] != null && confirmed == -1) confirmed = hits[i]["_source"]["CoPP_conformed"]
                    // console.log("check comfirm",i,dropped)

                }
                // console.log(self)
                self.chart.series[0].addPoint([x, dropped], true, true);
                self.chart.series[1].addPoint([x, confirmed], true, true);
                // console.log(self.chart)

            }, function(err) {
                console.trace(err.message);
            });
        }, 1000);
    }
    ngAfterViewInit() {
    const options: Highcharts.Options = {
      chart: {
        type: 'spline'
      },
      title: {
        text: ' '
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
      },
      yAxis: {
        title: {
          text: ' '
        }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.series.name + '</b><br/>' +
            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
            Highcharts.numberFormat(this.y, 2);
        }
      },
      series: [{
        name: 'dropped packet',
        data: (function () {
          // generate an array of random data
          var data = [],
            time = (new Date()).getTime(),
            i;

          for (i = -19; i <= 0; i += 1) {
            data.push({
              x: time + i * 1000,
              y: 0
            });
          }
          return data;
        }())
      },{
        name: 'confirmed packet',
        data: (function () {
          // generate an array of random data
          var data = [],
            time = (new Date()).getTime(),
            i;

          for (i = -19; i <= 0; i += 1) {
            data.push({
              x: time + i * 1000,
              y: 0
            });
          }
          return data;
        }())
      }]
    };
    this.chart = chart(this.chartTarget.nativeElement, options);
  }
}
