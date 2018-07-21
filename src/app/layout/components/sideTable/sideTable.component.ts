import {Component, OnInit, Output, EventEmitter, HostListener} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {LocalDataSource, ServerDataSource} from 'ng2-smart-table';
import {HttpClient} from '@angular/common/http';
import {switchTableService} from './../../Service/switchTable.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-sideTable',
    templateUrl: './sideTable.component.html',
    styleUrls: ['./sideTable.component.scss']
})
export class sideTableComponent {
    public isCollapsed = false;
    settings = {
        selectMode: 'multi',
        actions: false,
        columns: {

            ip: {
                title: 'Switch ip'
            }
        }
    };


    // source: ServerDataSource;
    source: LocalDataSource;
    data = [
        {
            id: '1',
            ip: '172.25.140.229',
            name: 'admin',
            pwd: 'Ciscolab123',
            nickname: 'n9k-14'
        }, {
            id: '2',
            ip: '172.27.251.113',
            name: 'admin',
            pwd: 'Lablab123',
            nickname: 'n9k-spine-1'
        }
    ];

    constructor(http: HttpClient,
                private st: switchTableService) {
        // this.source = new ServerDataSource(http, {endPoint: 'http://localhost:3000/switches'});
        this.source = new LocalDataSource(this.data);
    }

    public innerHeight: any;

    ngOnInit() {
        this.innerHeight = window.innerHeight;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.innerHeight = window.innerHeight;
        console.log(this.innerHeight);
    }


// @HostListener('onUserRowSelect')
    onUserRowSelect(event) {
        console.log(event.selected);
        this.data = event.selected;
        this.st.setSwitch(event.selected);

    }


}
