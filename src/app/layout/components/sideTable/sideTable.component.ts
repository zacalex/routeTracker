import { Component, OnInit ,Output, EventEmitter, HostListener} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LocalDataSource, ServerDataSource } from 'ng2-smart-table';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-sideTable',
    templateUrl: './sideTable.component.html',
    styleUrls: ['./sideTable.component.scss']
})
export class sideTableComponent {
    settings = {
      selectMode: 'multi',
      actions: false,
        columns: {

            ip: {
                title: 'Switch ip'
            }
        }
    };
    data = [
    ];

    source: ServerDataSource; // add a property to the component
// @Output() toggle: EventEmitter<null> = new EventEmitter();

constructor(http: HttpClient) {
  this.source = new ServerDataSource(http, { endPoint: 'http://localhost:3000/switches' });
}

// @HostListener('onUserRowSelect')
onUserRowSelect(event){
  console.log(event.selected)
  this.data = event.selected
  // this.toggle.emit(event.selected)
}


}
