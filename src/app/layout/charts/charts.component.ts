import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';
import drilldown from 'highcharts/modules/drilldown.src.js';
drilldown(Highcharts);
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

    @ViewChild('top1') top1: ElementRef;
    @ViewChild('top2') top2: ElementRef;
    @ViewChild('top3') top3: ElementRef;
    @ViewChild('top4') top4: ElementRef;
    @ViewChild('top5') top5: ElementRef;
    @ViewChild('detailPie') detailPie: ElementRef;


    chart: Highcharts.ChartObject;
    barChart: Highcharts.ChartObject;
    pieChart1: Highcharts.ChartObject;
    pieChart2: Highcharts.ChartObject;
    pieChart3: Highcharts.ChartObject;
    pieChart4: Highcharts.ChartObject;
    pieChart5: Highcharts.ChartObject;
    pieChart6: Highcharts.ChartObject;

    EventColors = ['#00FF00', '#FF0000'];

    ESresult = [];
    // bar chart
    // pieChartData = {};

    ES_QUERY_OWNER = {
        index: 'routetracker_event_stats_*',
        body: {
            'query': {
                'bool': {
                    'must':
                        [{
                            'exists': {
                                'field' : 'cnt_total'
                            }

                        }, {
                            'exists': {
                                'field' : 'owner_source'
                            }

                        }
                        ],
                    'must_not': [
                        {
                            'exists': {
                                'field': 'event'
                            }
                        }
                    ],
                    'filter': {
                        'range': {
                            'timestamp': {
                                'gte': 'now-1m',
                                'lte': 'now'
                            }
                        }
                    }
                }
            }
            , 'size': 1000,
            'sort': [
                {
                    'timestamp': {
                        'order': 'desc'
                    }
                }
            ]
        }

    };




    constructor(private es: ElasticsearchService) {

    }


    ngOnInit() {
        const self = this;

        setInterval(function () {
            // console.log('here to update point');
            // console.log(self.chart);
            // self.getCount();
            self.updataPieChart();

        }, 10000);
    }
    ngAfterViewInit() {
        this.initLineChart();
        this.initBarChart();
        // this.initPieChart();
        this.updataPieChart();

  }
  updataPieChart() {
      const self = this;
      this.es.search(this.ES_QUERY_OWNER).then(function (resp) {
          // console.log(resp.hits.hits);
          self.processVrfData(resp.hits.hits);

      }, function (err) {
          console.log(err.message);
      });
  }
  processVrfData(data) {
        // const self = this;
        const pieChartData = {};
        console.log(data);
        data.forEach(function (ele) {
            const para = ele._source;
            if (para['switchname'] in pieChartData) {
                if (para['owner'] in pieChartData[para['switchname']]) {
                    pieChartData[para['switchname']][para['owner']] += para['cnt_total'];
                }  else {
                    pieChartData[para['switchname']][para['owner']] = para['cnt_total'];
                }
            } else {
                pieChartData[para['switchname']] = {};
                pieChartData[para['switchname']][para['owner']] = para['cnt_total'];
            }
            if ('total' in pieChartData[para['switchname']]) {
                pieChartData[para['switchname']]['total'] += para['cnt_total'];
            } else {
                pieChartData[para['switchname']]['total'] = para['cnt_total'];
            }
        });

        console.log(pieChartData);
        this.initPieChart(pieChartData);
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
              name: 'changing route',
              data: []
          }]
      };
      this.chart = chart(this.chartTarget.nativeElement, options);
  }
  updateEventChart(pre , curr) {
      const self = this;
      this.ESresult = [];
      // console.log('here to use es get count');
      const data = {
          index: 'routetracker_event_stats_' + 'n9k-14' + '*',
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
              , 'size': 1000,
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
          console.log(resp.hits.hits);
          const addDic = [];
          const deleteDic = [];
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
          const log = {};
          log['switch'] = {};
          log['switch']['nickname'] = resp.hits.hits[0]._source.swname;

          log['logs'] = resp.hits.hits;
          self.ESresult.unshift(log);

      }, function (err) {
          console.log(err.message);
      });
  }
  getCount() {
        const self = this;
        // console.log('here to use es get count');
        const data = {
              index: 'routetracker_event_stats_' + 'n9k-14' + '*',
              body: {
                  'query': {
                      'bool': {
                          'must':
                              {
                                  'exists': {
                                      'field' : 'cnt_total'
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
            const y = resp.hits.hits[0]._source['cnt_total'];
            self.updateData(self.chart, 0, x, y);

        }, function (err) {
            console.log(err.message);
        });


  }
  updateData(currChart, ind, x , y) {
        // console.log('add point', x, y);
      const points = currChart.series[ind].data;
      if (points.length === 0) {
          currChart.series[ind].addPoint([x, y], true, false);
      } else if (points.length === 1) {

          const t2x = points[points.length - 1].options.x;

          if (x !== t2x) {
              console.log('extend last point at', x, y);
              currChart.series[ind].addPoint([x, y], true, false);
          }
      } else {
          // console.log(points)
          const t1x = points[points.length - 2].options.x;
          const t1y = points[points.length - 2].options.y;
          const t2x = points[points.length - 1].options.x;
          const t2y = points[points.length - 1].options.y;
          if (y !== t2y ) {
              // console.log('add point for changeing at', x, y);
              const indicator = this.EventColors[y > t2y ? 0 : 1];
              const marker = {
                  fillColor: indicator
              };
              currChart.series[ind].addPoint({
                  x: x,
                  y: y,
                  marker: marker
              }, true, false);
          } else if (t1y !== t2y) {
              console.log('add point for bend at', x, y);
              currChart.series[ind].addPoint([x, y], true, false);
          } else if (x !== t2x) {
              console.log('extend point at', x, y);
              // points[points.length - 1].x = x;
              currChart.series[ind].data[points.length - 1].update({
                  x: x,
                  y: y
              });
          }
      }
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
  initPieChart(data) {
        const self = this;
        const PIECHART_OPTIONS = {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text: 'switchname'
          },
          subtitle: {
              text: 'switchname'
          },
          tooltip: {
              pointFormat: '<b>{point.y}</b>'
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: false
                  },
                  // showInLegend: true
              }
          },
          series: [{
              name: 'count',
              colorByPoint: true,
              point: {
                  events: {
                      click: function (event) {
                          console.log(this);
                          // const name = this.options.name;
                          const paras = this.options.name.split('/');
                          const ES_QUERY_VRF = {
                              index: 'routetracker_event_stats_*',
                              body: {
                                  'query': {
                                      'bool': {
                                          'must':
                                              [{
                                                  'exists': {
                                                      'field' : 'cnt_total'
                                                  }

                                              }, {
                                                  'exists': {
                                                      'field' : 'vrf_source'
                                                  }

                                              }
                                              ],
                                          'must_not': [
                                              {
                                                  'exists': {
                                                      'field': 'event'
                                                  }
                                              }
                                          ],
                                          'filter': [{
                                              'range': {
                                                  'timestamp': {
                                                      'gte': 'now-1m',
                                                      'lte': 'now'
                                                  }
                                              }
                                          }, {
                                              'term': {
                                                  'switchname': paras[0]
                                              }
                                          },
                                              {
                                                  'term': {
                                                      'owner': paras[1]
                                                  }
                                              }]
                                      }
                                  }
                                  , 'size': 1000,
                                  'sort': [
                                      {
                                          'timestamp': {
                                              'order': 'desc'
                                          }
                                      }
                                  ]
                              }

                          };
                          self.es.search(ES_QUERY_VRF).then(function (resp) {
                              // console.log(resp.hits.hits);
                              self.setDetailPieChart(resp.hits.hits);

                          }, function (err) {
                              console.log(err.message);
                          });

                          // this.pieChart6 = chart(this.detailPie.nativeElement, options);
                      }
                  }
              },
              data: []
          }]
      };
        let pieChartDataList = [];
        for (const key in data) {
            const obj = {};
            obj['title'] = key;
            obj['total'] = data[key]['total'];
            obj['data'] = [];
            for (const owner in data[key]) {
                if (owner === 'total') { continue; }
                obj['data'].push({
                   name: key + '/' + owner,
                   y: data[key][owner]
                });
            }
            pieChartDataList.push(obj);
        }
        pieChartDataList = this.sortByCnt(pieChartDataList);

        PIECHART_OPTIONS.title.text = pieChartDataList[0].title;
        PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[0].total;
        PIECHART_OPTIONS.series[0].data = pieChartDataList[0].data;
        PIECHART_OPTIONS.series[0].name = pieChartDataList[0].title;
        this.pieChart1 = chart(this.top1.nativeElement, PIECHART_OPTIONS);

        PIECHART_OPTIONS.title.text = pieChartDataList[1].title;
        PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[1].total;
        PIECHART_OPTIONS.series[0].data = pieChartDataList[1].data;
        PIECHART_OPTIONS.series[0].name = pieChartDataList[1].title;
        this.pieChart2 = chart(this.top2.nativeElement, PIECHART_OPTIONS);

        PIECHART_OPTIONS.title.text = pieChartDataList[2].title;
        PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[2].total;
        PIECHART_OPTIONS.series[0].data = pieChartDataList[2].data;
        PIECHART_OPTIONS.series[0].name = pieChartDataList[2].title;
        this.pieChart3 = chart(this.top3.nativeElement, PIECHART_OPTIONS);

        PIECHART_OPTIONS.title.text = pieChartDataList[3].title;
        PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[3].total;
        PIECHART_OPTIONS.series[0].data = pieChartDataList[3].data;
        PIECHART_OPTIONS.series[0].name = pieChartDataList[3].title;
        this.pieChart4 = chart(this.top4.nativeElement, PIECHART_OPTIONS);

        PIECHART_OPTIONS.title.text = pieChartDataList[4].title;
        PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[4].total;
        PIECHART_OPTIONS.series[0].data = pieChartDataList[4].data;
        PIECHART_OPTIONS.series[0].name = pieChartDataList[4].title;
        this.pieChart5 = chart(this.top5.nativeElement, PIECHART_OPTIONS);

  }
  setDetailPieChart(data) {
        console.log(data);
        const vrfDic = {};
        var switchname = "";
        var owner = "";
        data.forEach(function (ele) {
          const para = ele._source;
          switchname = para.switchname;
          owner = para.owner;
          if (para['vrfname'] in vrfDic) {
              vrfDic[para['vrfname']] += para['cnt_total'];
          } else {
              vrfDic[para['vrfname']] = para['cnt_total'];
          }

        });
        const pieChartDataList = [];
          for (const key in vrfDic) {
              pieChartDataList.push({
                  name: key + '/' + owner + '/' + switchname,
                  y: vrfDic[key]
              });
          }
        const PIECHART_OPTIONS = {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text: 'switchname'
          },

          tooltip: {
              pointFormat: '<b>{point.y}</b>'
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: false
                  },
                  // showInLegend: true
              }
          },
          series: [{
              name: 'count',
              colorByPoint: true,
              point: {
                  events: {
                      click: function (event) {
                          console.log(this);
                          // const name = this.options.name;
                          const paras = this.options.name.split('/');
                          const ES_QUERY_VRF = {
                              index: 'routetracker_event_stats_*',
                              body: {
                                  'query': {
                                      'bool': {
                                          'must':
                                              [{
                                                  'exists': {
                                                      'field' : 'cnt_total'
                                                  }

                                              }, {
                                                  'exists': {
                                                      'field' : 'vrf_source'
                                                  }

                                              }
                                              ],
                                          'must_not': [
                                              {
                                                  'exists': {
                                                      'field': 'event'
                                                  }
                                              }
                                          ],
                                          'filter': [{
                                              'range': {
                                                  'timestamp': {
                                                      'gte': 'now-1m',
                                                      'lte': 'now'
                                                  }
                                              }
                                          }, {
                                              'term': {
                                                  'switchname': paras[0]
                                              }
                                          },
                                              {
                                                  'term': {
                                                      'owner': paras[1]
                                                  }
                                              }]
                                      }
                                  }
                                  , 'size': 1000,
                                  'sort': [
                                      {
                                          'timestamp': {
                                              'order': 'desc'
                                          }
                                      }
                                  ]
                              }

                          };
                          self.es.search(ES_QUERY_VRF).then(function (resp) {
                              // console.log(resp.hits.hits);
                              self.setDetailPieChart(resp.hits.hits);

                          }, function (err) {
                              console.log(err.message);
                          });

                          // this.pieChart6 = chart(this.detailPie.nativeElement, options);
                      }
                  }
              },
              data: []
          }]
      };
        PIECHART_OPTIONS.title.text = owner + '/' + switchname;

        PIECHART_OPTIONS.series[0].data = pieChartDataList;
        PIECHART_OPTIONS.series[0].name = owner + '/' + switchname;
        this.pieChart6 = chart(this.detailPie.nativeElement, PIECHART_OPTIONS);
    }
  sortByCnt(list) {
        return list.sort(function (a, b) {
            return b.total - a.total;
        });
  }
}
