import { Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class localBackendService {
   list:any;
   urlServer = 'http://localhost:3001/';
   rpmStatus = []
   TabLogs = []
   TabRpmReports = []
   status = "waiting"

   constructor(private http:HttpClient){
     setInterval(() => {
         this.http.post(this.urlServer + "report", { "hello": "hello" })
             .subscribe(res => {
                 this.processReport(res)
             });
     }, 3000);
   }
   processReport(report) {
       // console.log(report)
       // console.log(report['report'].nxapi)
       // console.log(report['report'].rpms)
       if (report['report'].rpms.length > 0) {
          console.log(report['report'].rpms)
           this.TabLogs.unshift(report['report'].rpms)
           console.log(this.TabLogs)
           for (var i in report['report'].rpms) {
               var currIp = report['report'].rpms[i].switchIp
               console.log(report['report'].rpms[i].rpmname)
               var paths = report['report'].rpms[i].rpmname.split("/")
               var currentRpm = paths[paths.length - 1].split("-")[0]
               console.log(currentRpm)
               for (var ind in this.rpmStatus) {
                   var st = this.rpmStatus[ind]
                   if (st.ip == currIp && st.rpm == currentRpm
                   && this.rpmStatus[ind].status == 'copying') {
                       console.log("found")
                       this.rpmStatus[ind].status = "installing"
                   }
               }
           }
       }
       if (report['report'].nxapi.length > 0) {
         console.log(report)
           // this.TabLogs.unshift(report['report'].nxapi)
           console.log(this.TabLogs)
           var str = ""
           for (var i in report['report'].nxapi) {
               str += report['report'].nxapi[i]['result']
               if (!this.isJson(str)) {
                   continue
               }
               console.log(str)
               console.log(report['report'].nxapi)
               var rpmName = report['report'].nxapi[i]['rpmName']
               var ip = report['report'].nxapi[i]['ip']
               var nxapiObj = JSON.parse(str.replace(/[\n\r]/g, ' '))
               str = ""
               console.log(nxapiObj)
               this.TabLogs.unshift(nxapiObj)
               if (nxapiObj.ins_api.type == 'cli_show') {
                   try {
                       var rpmReport = {}
                       rpmReport["ip"] = ip
                       if (nxapiObj.ins_api.outputs.output[0].body && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list
                           && nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list) {
                           rpmReport["active"] = nxapiObj.ins_api.outputs.output[0].body.TABLE_package_list.ROW_package_list
                           if (rpmReport["active"].constructor !== Array) {
                               rpmReport["active"] = [rpmReport["active"]]
                           }
                       }
                       if (nxapiObj.ins_api.outputs.output[1].body && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list
                           && nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list) {
                           // console.log("inactive")
                           rpmReport["inactive"] = nxapiObj.ins_api.outputs.output[1].body.TABLE_package_list.ROW_package_list
                           if (rpmReport["inactive"].constructor !== Array) {
                               rpmReport["inactive"] = [rpmReport["inactive"]]
                           }
                       }
                       this.TabRpmReports.unshift(rpmReport)
                       console.log(this.TabRpmReports)
                       this.status = "finished"
                   } catch (e) {
                       console.log(e)
                   }

               }
               else if (nxapiObj.ins_api.outputs.output.length == 2 &&
                   (nxapiObj.ins_api.outputs.output[1].msg == 'Success'
                       || nxapiObj.ins_api.outputs.output[1].clierror.includes("already active")
                   )
               ) {
                   this.status = "get somethgin back, please click the tab to load."
                   console.log("installed")
                   console.log(ip)
                   console.log(rpmName)
                   for (var ind in this.rpmStatus) {
                       var st = this.rpmStatus[ind]
                       if (st.ip == ip && st.rpm == rpmName) {
                           console.log("found")
                           this.rpmStatus[ind].status = "installed"
                       }
                   }
               }
               else if(nxapiObj.ins_api.outputs.output.code == '400') {
                   this.status = "get somethgin back, please click the tab to load."
                   console.log("failed")
                   console.log(ip)
                   console.log(rpmName)
                   for (var ind in this.rpmStatus) {
                       var st = this.rpmStatus[ind]
                       if (st.ip == ip && st.rpm == rpmName) {
                           console.log("found")
                           this.rpmStatus[ind].status = "failed"
                       }
                   }
               }
               else {
                   this.status = "get somethgin back, please click the tab to load."
               }
           }
       }

   }
   isJson(str) {
       try {
           JSON.parse(str);
       } catch (e) {
           return false;
       }
       return true;
   }
   pushTabrpmStatus(data){
     this.rpmStatus.unshift(data)
   }
//
}
