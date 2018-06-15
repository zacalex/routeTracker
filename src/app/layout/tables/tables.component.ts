import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})


export class TablesComponent implements OnInit {
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    url = 'http://localhost:3000/switches/';
    constructor(private http:HttpClient) {}
    data = []

    ngOnInit() {
      this.getConfig().subscribe(data => {
        console.log(data)
        this.data= Object.values(data)
    });
    }
    getConfig() {
      return this.http.get(this.url);
    }


    onDeleteConfirm(event) {
      console.log(event.data)
      if (window.confirm('Are you sure you want to delete?')) {
        event.confirm.resolve();

        const req = this.http.delete(this.url + event.data.id);
        req.subscribe(res => {
          console.log(res);
          this.updataData();
        });
        // this.data.remove(event.data);


      } else {
        event.confirm.reject();
      }
    }
    updataData(){
      this.getConfig().subscribe(data => {
          console.log(data)
          this.data= Object.values(data)
      });
    }
    onSaveConfirm(event) {

      if (window.confirm('Are you sure you want to save?')) {

        event.confirm.resolve(event.newData);

        const req = this.http.delete(this.url + event.data.id);
        req.subscribe(res => {
          console.log(res);

          var parameter = JSON.stringify(event.newData) ;
          console.log(parameter);

          const req = this.http.post(this.url, parameter, this.httpOptions);
          req.subscribe();
        });

      } else {
        event.confirm.reject();
      }
    }

    onCreateConfirm(event) {


      if (window.confirm('Are you sure you want to create?')) {
        event.confirm.resolve(event.newData);

        var parameter = JSON.stringify(event.newData) ;
        console.log(parameter);

        const req = this.http.post(this.url, parameter, this.httpOptions);
        req.subscribe();


      } else {
        event.confirm.reject();
      }
    }
    onCreateSwitch(id,ip,username,pwd, sn){
      var value = {
        "id" : id.value,
        "ip" : ip.value,
        "name" : username.value,
        "pwd" : pwd.value,
        "nickname" : sn
      }
      console.log(value);
      var parameter = JSON.stringify(value) ;
      console.log(parameter);
      id.value = ""
      ip.value = ""
      username.value = ""
      pwd.value = ""
      const req = this.http.post(this.url, parameter, this.httpOptions);
      req.subscribe(res => {
        this.updataData()
      });
    }
    onRemoveSwitch(value){
      const req = this.http.delete(this.url + value.id);
      req.subscribe(res => {
        this.updataData()
      });
    }
}
