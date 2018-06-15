import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routerTransition } from '../../../router.animations';
import { switchTableService } from './../../Service/switchTable.service'
import {nxapiService} from './../../Service/nxapi.service'

@Component({
    selector: 'app-routeTracker',
    templateUrl: './routeTracker.component.html',
    styleUrls: ['./routeTracker.component.scss'],
    animations: [routerTransition()]
})
export class RouteTrackerComponent implements OnInit {
    ipVer = "none"
    rpmName = "routeTracker"
    public isCollapsed = false;
    constructor(private st: switchTableService,
                private nxapi : nxapiService) {
    }

    ngOnInit() { }
    ipVerSelected(event){
      console.log(event)
      this.ipVer = event.target.value
    }

    onWatch(protocol, tag, vrf){
      // console.log(protocol)
      // console.log(tag)
      // console.log(this.ipVer)
      // console.log(vrf)
      var cli = this.constructRouteTrackerCli(protocol,tag,this.ipVer,vrf)
      console.log(cli)
      // console.log(this.st.get)
      // this.targetSwitch = this.switchTable.data
      this.nxapi.preRunCli(cli,this.st.getSwitchData(),this.rpmName)
    }

    onUnWatch(protocol, tag, vrf){
      // console.log(protocol)
      // console.log(tag)
      // console.log(this.ipVer)
      // console.log(vrf)
      var cli = "no " + this.constructRouteTrackerCli(protocol,tag,this.ipVer,vrf)
      console.log(cli)
      // this.targetSwitch = this.switchTable.data
      this.nxapi.preRunCli(cli, this.st.getSwitchData(),this.rpmName)
    }

    constructRouteTrackerCli(protocol,tag,ipVer,vrf){
      var cli = this.rpmName + " watch owner " + protocol
      if(tag.length > 0) cli += " " + tag
      if(ipVer != "none") cli += " " + ipVer
      if(vrf.length > 0) cli += " " + vrf
      console.log(cli)
      return cli
    }

    onStart(){
      var cli = "feature nxsdk ;nxsdk service-name " + this.rpmName
      console.log("start app" + this.rpmName)
      console.log(cli)
      this.nxapi.preRunCli(cli, this.st.getSwitchData(), this.rpmName)
    }
    onStop(){
      var cli = "feature nxsdk ;no nxsdk service-name " + this.rpmName
      console.log("start app" + this.rpmName)
      console.log(cli)
      this.nxapi.preRunCli(cli, this.st.getSwitchData(), this.rpmName)
    }



}
