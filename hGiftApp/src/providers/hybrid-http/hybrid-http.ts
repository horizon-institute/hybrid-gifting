import { HttpClient, HttpResponse } from '@angular/common/http';
import { HTTP, HTTPResponse } from '@ionic-native/http';
import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

/*
  This provider abstracts HTTP calls from Angular AJAX and Cordova Native plugins.
  The main difference between the two is that AJAX is restricted by the 
  "Access-Control-Allow-Origin" header while native is not.
*/
@Injectable()
export class HybridHttpProvider {

  private native = true;

  constructor(
    private http: HttpClient,
    private nhttp: HTTP,
    private file: File
  ) {
    console.log('Hello HybridHttpProvider Provider');
  }

  public get(url: string, headers={}): Promise<{}> {
    if (this.native) {
      return this.nhttp.get(url, {}, headers).then((value: HTTPResponse)=>{
        console.log(value);
        let result = {
          "code": value.status,
          "headers": value.headers,
          "body": value.data
        };
        if (value.hasOwnProperty('base64')) result['base64'] = value['base64'];
        return result;
      });
    } else {
      // TODO: 
      return this.http.get(url).toPromise().then((value)=>{ 
        console.log(value);
        return {
          "code": parseInt(value['status']),
          "headers": value['headers'],
          "body": value['body']
        };
      });
    }
  }

  public download(url: string, headers={}, filePath: string): Promise<any> {
    if (this.native) {
      console.log("download to file path: "+filePath);
      return this.nhttp.downloadFile(url, {}, headers, filePath).then((value: any)=>{
        console.log(value);
        return value;
      });
    } else {
      return new Promise<any>((resolve, reject)=>{ reject("File downloads are not available on this platform."); });
    }
  }

  public isDownloadAvailable(): boolean {
    return this.native;
  }

  public post(url: string, headers={}, body:any={}): Promise<{}> {
    if (this.native) {
      return new Promise<{}> ((resolve, reject)=>{
        eval('cordova.plugin.http.sendRequest')(
          url,
          { method: 'post', data: (typeof body != 'object' ? JSON.parse(body) : body), headers: headers, serializer: 'json' }, 
          (response)=>{
            console.log("POST STATUS: "+response.status);
            console.log("POST HEADERS: "+JSON.stringify(response.headers));
            console.log("POST DATA: "+response.data);
            response.data = JSON.parse(response.data);
            // prints test
            console.log(response.data.message);
            resolve({
              "code": response.status,
              "headers": response.headers,
              "body": response.data
            });
          }, 
          (response)=>{
            console.log("POST STATUS: "+response.status);
            console.log("POST HEADERS: "+JSON.stringify(response.headers));
            console.log("POST ERROR: "+response.error);
            reject(response);
          }
        );
      });

      /*
      return this.nhttp.post(url, typeof body != 'object' ? JSON.parse(body) : body, headers).then((value: HTTPResponse)=>{
        console.log("value.data");
        console.log(value.data);
        return {
          "code": value.status,
          "headers": value.headers,
          "body": value.data
        };
      });
      */
    } else {
      // TODO: 
    }
  }
}

