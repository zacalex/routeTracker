import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
// import {routerTransition} from '../../../router.animations';
import {chart} from 'highcharts';
import * as Highcharts from 'highcharts';
import drilldown from 'highcharts/modules/drilldown.src.js';
import {FormBuilder, FormGroup} from '@angular/forms';

drilldown(Highcharts);
import {Client} from 'elasticsearch-browser';
import {ElasticsearchService} from '../../../Service/elasticsearch.service';

@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss'],
    // animations: [routerTransition()]
})
export class ChartsComponent implements OnInit {

    // highcharts
    public chartHeight = 35;


    // element for charts
    @ViewChild('chartTarget') chartTarget: ElementRef;
    @ViewChild('top1') top1: ElementRef;
    @ViewChild('top2') top2: ElementRef;
    @ViewChild('top3') top3: ElementRef;
    @ViewChild('top4') top4: ElementRef;
    @ViewChild('top5') top5: ElementRef;
    @ViewChild('detailPie') detailPie: ElementRef;


    // Highchart objects
    chart: Highcharts.ChartObject;
    barChart: Highcharts.ChartObject;
    pieChart1: Highcharts.ChartObject;
    pieChart2: Highcharts.ChartObject;
    pieChart3: Highcharts.ChartObject;
    pieChart4: Highcharts.ChartObject;
    pieChart5: Highcharts.ChartObject;
    pieChart6: Highcharts.ChartObject;

    // colors for line chart dots
    EventColors = ['#00FF00', '#FF0000'];


    detailName = 'test';
    lineChartname = 'test';
    EventChartname = 'test';
    autoFlag = true;
    switchCounts = 0;
    switchname = '';
    owner = '';

    tableTitle = 'latest on ';
    public radioGroupForm: FormGroup;


    ESresult = {};
    ESLogresult = {
        switch: {
            nickname: ''
        },
        logs: []
    };
    // bar chart
    // pieChartData = {};

    // ES_QUERY_OWNER = {
    //     index: 'routetracker_event_stats_*',
    //     body: {
    //         'query': {
    //             'bool': {
    //                 'must':
    //                     [{
    //                         'exists': {
    //                             'field': 'cnt_total'
    //                         }
    //
    //                     }, {
    //                         'exists': {
    //                             'field': 'owner_source'
    //                         }
    //
    //                     }
    //                     ],
    //                 'must_not': [
    //                     {
    //                         'exists': {
    //                             'field': 'event'
    //                         }
    //                     }
    //                 ],
    //                 'filter': {
    //                     'range': {
    //                         'timestamp': {
    //                             'gte': 'now-1h',
    //                             'lte': 'now'
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         , 'size': 50,
    //         'sort': [
    //             {
    //                 'timestamp': {
    //                     'order': 'desc'
    //                 }
    //             }
    //         ]
    //     }
    //
    // };

    ES_QUERY_AGGS_OWNER = {
        index: 'routetracker*',
        body: {
            'query': {
                'bool': {
                    'must': [
                        {
                            'exists': {
                                'field': 'event'
                            }
                        }
                    ],
                    'filter': {
                        'range': {
                            'timestamp': {
                                'gte': 'now-5m',
                                'lte': 'now'
                            }
                        }
                    }
                }

            }, 'size': 0,
            'aggs': {
                'agg1': {
                    'terms': {
                        'field': 'switchname.keyword'
                    },
                    'aggs': {
                        'agg2': {
                            'terms': {
                                'field': 'owner.keyword'
                            }
                        }
                    }
                }
            }
        }

    };
    ES_QUERY_AGGS_VRF = {
        index: 'routetracker*',
        body: {
            'query': {
                'bool': {
                    'must': [
                        {
                            'exists': {
                                'field': 'event'
                            }
                        }
                    ],
                    'filter': [{
                        'range': {
                            'timestamp': {
                                'gte': 'now-5m',
                                'lte': 'now'
                            }
                        }
                    }, {
                        'term': {
                            'switchname': ''
                        }
                    }, {
                        'term': {
                            'owner': ''
                        }
                    }
                    ]
                }

            }, 'size': 0,
            'aggs': {
                'agg1': {
                    'terms': {
                        'field': 'vrfname.keyword'
                    }
                }
            }
        }

    };
    ES_QUERY_AGGS_EVENT = {
        index: 'routetracker*',
        body: {
            'query': {
                'bool': {
                    'must': [
                        {
                            'exists': {
                                'field': 'event'
                            }
                        }
                    ],
                    'filter': [{
                        'range': {
                            'timestamp': {
                                'gte': 'now-3d',
                                'lte': 'now'
                            }
                        }
                    }, {
                        'term': {
                            'switchname': ''
                        }
                    }, {
                        'term': {
                            'owner': ''
                        }
                    }, {
                        'term': {
                            'vrfname': ''
                        }
                    }
                    ]
                }

            }, 'size': 0,
            'aggs': {
                'agg1': {
                    'terms': {
                        'field': 'event.keyword'
                    },
                    'aggs': {
                        'cnt_over_time': {
                            'date_histogram': {
                                'field': 'timestamp',
                                'interval': '5m',
                                'keyed': false
                            }
                        }
                    }
                }
            }
        }

    };
    ES_QUERY_TABLE = {
        index: 'routetracker_*',
        body: {
            'query': {
                'bool': {
                    'must': [
                        {
                            'exists': {
                                'field': 'event'
                            }
                        }
                    ]
                    ,
                    'filter': [
                        {
                            'range': {
                                'timestamp': {
                                    'gte': '',
                                    'lte': ''
                                }
                            }
                        }
                        , {
                            'term': {
                                'switchname': ''
                            }
                        },
                        {
                            'term': {
                                'owner': ''
                            }
                        },
                        {
                            'term': {
                                'vrfname': ''
                            }
                        }

                    ]
                }
            }
            , 'size': 50,

            'sort': [
                {
                    'timestamp': {
                        'order': 'desc'
                    }
                }
            ]
        }

    };



    constructor(private es: ElasticsearchService,
                private formBuilder: FormBuilder) {

    }


    ngOnInit() {
        const self = this;

        this.radioGroupForm = this.formBuilder.group({
            'model': 'current_switch'
        });

        setInterval(function () {
            // console.log('here to update point');
            // console.log(self.chart);
            // self.getCount();
            self.updataPieChart();

        }, 10000);
    }

    ngAfterViewInit() {


        // this.initBarChart();
        this.updataPieChart();

    }


    // linechart
    initLineChart(data, switchname, owner, vrfname) {
        const self = this;
        const options: Highcharts.Options = {
            chart: {
                events: {
                    selection: function (event) {
                        let text,
                            label;
                        if (event.xAxis) {
                            text = 'min: ' + Highcharts.numberFormat(event.xAxis[0].min, 2) + ', max: '
                                + Highcharts.numberFormat(event.xAxis[0].max, 2);
                            console.log('selection');
                            const gte = Math.floor( event.xAxis[0].min );
                            const lte = Math.ceil( event.xAxis[0].max );
                            console.log(gte);
                            console.log(lte);
                            self.updateTable(gte, lte, switchname, owner, vrfname);

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
                        self.autoFlag = false;
                    }
                },
                zoomType: 'x'
            },
            global: {
                useUTC: false
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
                enabled: true
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    // console.log(this.x)
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        this.y;
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
                                self.updateTable(preTime, currentTime, switchname, owner, vrfname);
                                self.autoFlag = false;
                            }
                        }
                    }
                }
            },
            series: [{
                name: data[0].key,
                data: (function () {
                    const lineChartData = [];
                    data[0].cnt_over_time.buckets.forEach(function (ele) {
                        const x = ele.key;
                        const y = ele.doc_count;
                        lineChartData.push({
                            x: x,
                            y: y
                        });
                    });
                    return lineChartData;
                }())

            }, {
                name: data[1].key,
                data: (function () {
                    const lineChartData = [];
                    data[1].cnt_over_time.buckets.forEach(function (ele) {
                        const x = ele.key;
                        const y = ele.doc_count;
                        lineChartData.push({
                            x: x,
                            y: y
                        });
                    });
                    return lineChartData;
                }())
            }]
        };

        this.chart = chart(this.chartTarget.nativeElement, options);
    }


    updateTable(pre, curr, switchname, owner, vrfname) {
        const self = this;
        self.tableTitle = switchname + '/' + owner + '/' + vrfname + ' from ' + pre + ' to ' + curr;
        // this.initBarChart();
        console.log(switchname, owner, vrfname);


        self.ES_QUERY_TABLE.body.query.bool.filter[0].range.timestamp.gte = pre;
        self.ES_QUERY_TABLE.body.query.bool.filter[0].range.timestamp.lte = curr;
        self.ES_QUERY_TABLE.body.query.bool.filter[1].term.switchname = switchname;
        self.ES_QUERY_TABLE.body.query.bool.filter[2].term.owner = owner;
        self.ES_QUERY_TABLE.body.query.bool.filter[3].term.vrfname = vrfname;

        self.ESLogresult['switch']['nickname'] = switchname;
        self.ESLogresult['logs'] = [];

        // console.log(time);
        this.es.search(this.ES_QUERY_TABLE).then(function (resp) {


            console.log(resp.hits.hits);
            for (const ele of resp.hits.hits) {
                self.ESLogresult['logs'].push(ele);
            }


        }, function (err) {
            console.log(err.message);
        });

        console.log('printlog', self.ESLogresult);


    }

    searchForDetailPieChart(input) {
        const self = this;
        const paras = input.split('/');
        self.switchname = paras[0];
        self.owner = paras[1];
        self.ES_QUERY_AGGS_VRF.body.query.bool.filter[1].term.switchname = paras[0];
        self.ES_QUERY_AGGS_VRF.body.query.bool.filter[2].term.owner = paras[1];
        self.es.search(self.ES_QUERY_AGGS_VRF).then(function (resp) {
            console.log(resp);
            self.setDetailPieChart(resp.aggregations.agg1.buckets);

        }, function (err) {
            console.log(err.message);
        });
    }

    // piechart
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
                            console.log(this.options.name);
                            // const name = this.options.name;
                            self.searchForDetailPieChart(this.options.name);
                            self.autoFlag = false;
                        }
                    }
                },
                data: []
            }]
        };
        this.switchCounts = 0;
        let pieChartDataList = [];
        console.log(data);
        for (const key in data) {
            const obj = {};
            obj['title'] = key;
            obj['total'] = data[key]['total'];
            obj['data'] = [];
            for (const owner in data[key]) {
                if (owner === 'total') {
                    continue;
                }
                obj['data'].push({
                    name: key + '/' + owner,
                    y: data[key][owner]
                });
            }
            pieChartDataList.push(obj);
        }
        pieChartDataList = this.sortByCnt(pieChartDataList);
        console.log(pieChartDataList);
        if (pieChartDataList[0]) {
            this.switchCounts++;
            PIECHART_OPTIONS.title.text = pieChartDataList[0].title;
            PIECHART_OPTIONS.subtitle.text = 'event: ' + pieChartDataList[0].total;
            PIECHART_OPTIONS.series[0].data = pieChartDataList[0].data;
            PIECHART_OPTIONS.series[0].name = pieChartDataList[0].title;
            this.pieChart1 = chart(this.top1.nativeElement, PIECHART_OPTIONS);
            if (this.autoFlag) {

                const input = pieChartDataList[0].data[1];
                this.searchForDetailPieChart(input.name);


            }
        }

        if (pieChartDataList[1]) {
            this.switchCounts++;
            PIECHART_OPTIONS.title.text = pieChartDataList[1].title;
            PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[1].total;
            PIECHART_OPTIONS.series[0].data = pieChartDataList[1].data;
            PIECHART_OPTIONS.series[0].name = pieChartDataList[1].title;
            this.pieChart2 = chart(this.top2.nativeElement, PIECHART_OPTIONS);
        }

        if (pieChartDataList[2]) {
            this.switchCounts++;
            PIECHART_OPTIONS.title.text = pieChartDataList[2].title;
            PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[2].total;
            PIECHART_OPTIONS.series[0].data = pieChartDataList[2].data;
            PIECHART_OPTIONS.series[0].name = pieChartDataList[2].title;
            this.pieChart3 = chart(this.top3.nativeElement, PIECHART_OPTIONS);
        }

        if (pieChartDataList[3]) {
            this.switchCounts++;
            PIECHART_OPTIONS.title.text = pieChartDataList[3].title;
            PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[3].total;
            PIECHART_OPTIONS.series[0].data = pieChartDataList[3].data;
            PIECHART_OPTIONS.series[0].name = pieChartDataList[3].title;
            this.pieChart4 = chart(this.top4.nativeElement, PIECHART_OPTIONS);
        }
        if (pieChartDataList[4]) {
            this.switchCounts++;
            PIECHART_OPTIONS.title.text = pieChartDataList[4].title;
            PIECHART_OPTIONS.subtitle.text = 'total; ' + pieChartDataList[4].total;
            PIECHART_OPTIONS.series[0].data = pieChartDataList[4].data;
            PIECHART_OPTIONS.series[0].name = pieChartDataList[4].title;
            this.pieChart5 = chart(this.top5.nativeElement, PIECHART_OPTIONS);
        }

    }

    updataPieChart() {
        const self = this;

        this.es.search(this.ES_QUERY_AGGS_OWNER).then(function (resp) {

            if (resp) {
                console.log(resp);
                self.processVrfAgg(resp.aggregations.agg1.buckets);
            } else {
                console.log('empty response');
            }


        }, function (err) {
            console.log(err.message);
        });
    }

    processVrfAgg(data) {
        console.log(data);
        const pieChartData = {};

        data.forEach(function (ele) {
            const title = ele.key;
            const agg2 = ele.agg2.buckets;
            pieChartData[title] = {};
            let total = 0;
            agg2.forEach(function (cnts) {
                pieChartData[title][cnts.key] = cnts.doc_count;
                total += cnts.doc_count;
            });
            pieChartData[title]['total'] = total;
        });

        console.log(pieChartData);
        this.initPieChart(pieChartData);
    }


    searchForLineChart(input) {
        const self = this;
        self.lineChartname = input;
        self.tableTitle = 'details for ' + input;
        // const name = this.options.name;
        const paras = input.split('/');

        self.ES_QUERY_AGGS_EVENT.body.query.bool.filter[1].term.switchname = paras[0];
        self.ES_QUERY_AGGS_EVENT.body.query.bool.filter[2].term.owner = paras[1];
        self.ES_QUERY_AGGS_EVENT.body.query.bool.filter[3].term.vrfname = paras[2];
        self.es.search(self.ES_QUERY_AGGS_EVENT).then(function (resp) {
            console.log("init line chart");
            console.log(resp.aggregations);
            self.initLineChart(resp.aggregations.agg1.buckets, paras[0], paras[1], paras[2]);


        }, function (err) {
            console.log(err.message);
        });
        self.updateTable('now-1y', 'now', paras[0], paras[1], paras[2]);
    }

    // detailPieChart
    setDetailPieChart(data) {
        const self = this;
        console.log(data);
        const vrfDic = {};
        const switchname = this.switchname;
        const owner = this.owner;
        let vrf = '';
        data.forEach(function (ele) {
            const title = ele.key;
            vrfDic[title] = ele.doc_count;
            vrf = title;

        });
        const pieChartDataList = [];
        for (const key in vrfDic) {
            pieChartDataList.push({
                name: switchname + '/' + owner + '/' + key,
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
                text: null
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
                    showInLegend: true
                }
            },
            series: [{
                name: 'count',
                colorByPoint: true,
                point: {
                    events: {
                        click: function (event) {
                            console.log(this);
                            self.tableTitle = 'details for ' + this.options.name;
                            self.searchForLineChart(this.options.name);
                            self.autoFlag = false;

                        }
                    }
                },
                data: []
            }]
        };


        PIECHART_OPTIONS.series[0].data = pieChartDataList;
        PIECHART_OPTIONS.series[0].name = owner + '/' + switchname;
        this.detailName =  switchname + '/' + owner;

        this.pieChart6 = chart(this.detailPie.nativeElement, PIECHART_OPTIONS);
        if (this.autoFlag) {
            this.searchForLineChart(pieChartDataList[0].name);
            this.updateTable('now-1y', 'now', switchname, owner, vrf);
        }
    }

    sortByCnt(list) {
        return list.sort(function (a, b) {
            return b.total - a.total;
        });
    }

    onSearch(prefix) {
        this.autoFlag = false
        const self = this;
        prefix = prefix.trim().replace('\/', '_').replace('\\', '_');
        console.log(prefix);
        let query = {};

        if (this.radioGroupForm.value.model === 'all_switches') {
            this.tableTitle = 'latest changes for ' + prefix + ' on all switches';
            query = {
                index: 'routetracker_*',
                body: {
                    'query': {
                        'bool': {
                            'filter': {
                                'term': {
                                    'prefix': prefix
                                }
                            }
                        }
                    },
                    'size': 0,
                    'aggs': {

                        'agg1': {
                            'terms': {
                                'field': 'switchname.keyword'
                            },

                            'aggs': {
                                'agg2': {
                                    'top_hits': {
                                        'size': 1,
                                        'sort': [
                                            {
                                                'timestamp': {
                                                    'order': 'desc'
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            };
            this.es.search(query).then(function (resp) {
                console.log(resp.aggregations);
                self.ESLogresult.logs = [];
                // self.ESLogresult.logs = resp.aggregations.agg1.buckets;
                resp.aggregations.agg1.buckets.forEach(function (aggEle) {
                    self.ESLogresult.logs.push(aggEle.agg2.hits.hits[0]);
                });
                console.log("show res on all switch");
            }, function (err) {
                console.log(err.message);
            });
        } else {
            this.tableTitle = 'latest changes for ' + prefix + ' on ' + this.ESLogresult.switch.nickname;
            query = {
                index: 'routetracker_*',
                body: {
                    'query': {
                        'bool': {

                            'filter': [{
                                'range': {
                                    'timestamp': {
                                        'gte': 'now-1y',
                                        'lte': 'now'
                                    }
                                }
                            }, {
                                'term': {
                                    'prefix': prefix
                                }
                            },
                                {
                                    'term': {
                                        'switchname': self.ESLogresult.switch.nickname
                                    }
                                }
                            ]
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
            this.es.search(query).then(function (resp) {
                console.log(resp.hits.hits);
                self.ESLogresult.logs = resp.hits.hits;
            }, function (err) {
                console.log(err.message);
            });

        }


    }
}
