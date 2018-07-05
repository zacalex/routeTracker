import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';
import { Client } from 'elasticsearch-browser';

import {ElasticsearchService} from '../Service/elasticsearch.service';

@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss'],
    animations: [routerTransition()]
})
export class ChartsComponent implements OnInit {

    // highcharts
    public chartHeight = 35;

    @ViewChild('chartTarget') chartTarget: ElementRef;
    @ViewChild('ipBarChart') ipBarChart: ElementRef;

    chart: Highcharts.ChartObject;
    barChart: Highcharts.ChartObject;

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
    public barChartType = 'bar';
    public barChartLegend = true;

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
    public doughnutChartType = 'doughnut';

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
    public radarChartType = 'radar';

    // Pie
    public pieChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail Sales'
    ];
    public pieChartData: number[] = [300, 500, 100];
    public pieChartType = 'pie';

    // PolarArea
    public polarAreaChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail Sales',
        'Telesales',
        'Corporate Sales'
    ];
    public polarAreaChartData: number[] = [300, 500, 100, 40, 120];
    public polarAreaLegend = true;

    public polarAreaChartType = 'polarArea';

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
    public lineChartLegend = true;
    public lineChartType = 'line';

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

    constructor(private es: ElasticsearchService) {

    }


    ngOnInit() {
        const self = this;

        setInterval(function () {
            // console.log('here to update point');
            // console.log(self.chart);
            self.getCount();

        }, 2000);
    }
    ngAfterViewInit() {
        this.initLineChart();
        this.initBarChart();
        const query = {
            index: 'routetracker_tm_vrf_stats_' + 'n9k-14' + '*',
            body: {
                'query': {
                    'bool': {
                        'must':
                            {
                                'exists': {
                                    'field' : 'cnt-total'
                                }
                            },
                        'filter': {
                            'range': {
                                'timestamp': {
                                    'gte': 'now-30m',
                                    'lte': 'now'
                                }
                            }
                        }
                    }
                }
                , 'size': 10,
                'sort': [
                    {
                        'timestamp': {
                            'order': 'desc'
                        }
                    }
                ]
            }

        };
        const self = this;
        this.es.search(query).then(function (resp) {
            console.log(resp.hits.hits);
            var data = [];
            resp.hits.hits.forEach(function (ele) {
                const x = parseInt(ele._source.timestamp);
                const y = ele._source['cnt-total'];
                console.log(x, y);
                data.push({
                    x: x,
                    y: y
                });
            });
            self.chart.series[0].setData(data.reverse(), true);

        }, function (err) {
            console.log(err.message);
        });
  }
  initLineChart() {
        const self = this;
      const options: Highcharts.Options = {
          chart: {
              events: {
                  selection: function (event) {
                      let text,
                          label;
                      if (event.xAxis) {
                          text = 'min: ' + Highcharts.numberFormat(event.xAxis[0].min, 2) + ', max: ' + Highcharts.numberFormat(event.xAxis[0].max, 2);
                          console.log('selection');
                          const gte = event.xAxis[0].min;
                          const lte = event.xAxis[0].max;
                          console.log(gte);
                          console.log(lte);
                          self.updateEventChart(gte, lte);

                      } else {
                          text = 'Selection reset';
                      }
                      label = this.renderer.label(text, 100, 120)
                          .attr({
                              fill: Highcharts.getOptions().colors[0],
                              padding: 10,
                              r: 5,
                              zIndex: 8
                          })
                          .css({
                              color: '#FFFFFF'
                          })
                          .add();

                      setTimeout(function () {
                          label.fadeOut();
                      }, 1000);
                  }
              },
              zoomType: 'x'
          },
          global: {
              useUTC : false
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
          legend: {
              enabled: false
          },
          exporting: {
              enabled: false
          },
          tooltip: {
              formatter: function () {
                  // console.log(this.x)
                  return '<b>' + this.series.name + '</b><br/>' +
                      Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                      Highcharts.numberFormat(this.y, 2);
              }
          },
          plotOptions: {
              series: {
                  cursor: 'pointer',
                  point: {
                      events: {
                          click: function (event) {
                              console.log(event);
                              const currentTime = event.point.options.x;
                              console.log(currentTime);
                              const id = event.point.index;
                              const preTime = self.chart.series[0].data[id - 1].options.x;
                              console.log(preTime);
                              self.updateEventChart(preTime, currentTime);
                          }
                      }
                  }
              }
          },
          series: [{
              name: 'dropped packet',
              data: (function () {
                  // generate an array of random data

                  // console.log('here to use es get count');

                  const data = [];
                  console.log(data);
                  return data;
              }())
          }]
      };
      this.chart = chart(this.chartTarget.nativeElement, options);
  }
  updateEventChart(pre , curr) {
      const self = this;
      // console.log('here to use es get count');
      const data = {
          index: 'routetracker_tm_vrf_stats_' + 'n9k-14' + '*',
          body: {'query': {
                  'bool': {
                      'must':
                          {
                              'exists': {
                                  'field' : 'event'
                              }
                          },
                      'filter': {
                          'range': {
                              'timestamp': {
                                  'gte': pre,
                                  'lte': curr
                              }
                          }
                      }
                  }
              }
              , 'size': 1000
          }

      };
      this.es.search(data).then(function (resp) {
          console.log(resp.hits.hits);
          let addDic = [];
          let deleteDic = [];
          resp.hits.hits.forEach(function (ele) {
              if (ele._source.event === 'Add') {
                  addDic.push(ele);
              } else if (ele._source.event === 'Delete') {
                  deleteDic.push(ele);
              }
          });
          self.barChart.series[0].setData([addDic.length + deleteDic.length]);
          self.barChart.series[1].setData([addDic.length]);
          self.barChart.series[2].setData([deleteDic.length], true);


      }, function (err) {
          console.log(err.message);
      });
  }
  getCount() {
        const self = this;
        // console.log('here to use es get count');
        const data = {
              index: 'routetracker_tm_vrf_stats_' + 'n9k-14' + '*',
              body: {
                  'query': {
                      'bool': {
                          'must':
                              {
                                  'exists': {
                                      'field' : 'cnt-total'
                                  }
                              }
                      }
                  },
                  'size': 1,
                  'sort': [
                      {
                          'timestamp': {
                              'order': 'desc'
                          }
                      }
                  ]
              }

        };
        this.es.search(data).then(function (resp) {
            // console.log(resp.hits.hits[0]);
            const x = parseInt(resp.hits.hits[0]._source['timestamp']);
            const z = resp.hits.hits[0]._source['timestamp'];
            const y = resp.hits.hits[0]._source['cnt-total'];


            console.log(x);
            console.log(y);
            const points = self.chart.series[0].data;
            // console.log(points[points.length - 1]);
            const lastPoint = points[points.length - 1];
            if (points.length === 0 || lastPoint.options.x < x) {
                self.chart.series[0].addPoint([x, y], true, false);
                console.log('add new point at', x);
            }

        }, function (err) {
            console.log(err.message);
        });


  }
  initBarChart() {
      const options: Highcharts.Options = {
          chart: {
              type: 'column'
          },
          title: {
              text: 'changing ip'
          },
          xAxis: {
              categories: ['n9k-14']
          },
          yAxis: {
              title: {
                  text: ' '
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true
          },
          plotOptions: {
              column: {
                  pointPadding: 0.2,
                  borderWidth: 0
              }
          },
          series: [{
              name: 'total',
              data: [30]

          }, {
              name: 'add',
              data: [10]
          }, {
              name: 'delete',
              data: [20]
          }]
      };
      this.barChart = chart(this.ipBarChart.nativeElement, options);
  }
}
