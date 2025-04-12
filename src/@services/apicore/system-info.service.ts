// src/app/services/system-info.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private systemData: any;

  constructor(private http: HttpClient) {
    // Aquí puedes cargar los datos desde una API o dejarlos estáticos
    this.systemData = [
      {
        "system": {
            "hostname": "bdatos",
            "uptime": "up 13 weeks, 3 days, 7 hours, 48 minutes",
            "os": "",
            "kernel": "4.18.0-552.el8.x86_64",
            "architecture": "x86_64"
        },
        "cpu": {
            "model": "Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz",
            "cores": 32,
            "threads": 16,
            "load_average": "1.13, 1.09, 1.10"
        },
        "memory": {
            "total": "62Gi",
            "used": "7.2Gi",
            "free": "34Gi",
            "swap_total": "31Gi",
            "swap_used": "0B",
            "swap_free": "31Gi"
        },
        "disks": [{"filesystem":"devtmpfs","size":"32G","used":"0","avail":"32G","use%":"0%","mounted":"/dev"},{"filesystem":"tmpfs","size":"32G","used":"1.1M","avail":"32G","use%":"1%","mounted":"/dev/shm"},{"filesystem":"tmpfs","size":"32G","used":"3.2G","avail":"29G","use%":"10%","mounted":"/run"},{"filesystem":"tmpfs","size":"32G","used":"0","avail":"32G","use%":"0%","mounted":"/sys/fs/cgroup"},{"filesystem":"/dev/mapper/cs-root","size":"70G","used":"41G","avail":"30G","use%":"58%","mounted":"/"},{"filesystem":"/dev/loop3","size":"64M","used":"64M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core20/2434"},{"filesystem":"/dev/loop5","size":"105M","used":"105M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core/17200"},{"filesystem":"/dev/loop8","size":"104M","used":"104M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core/16928"},{"filesystem":"/dev/sda2","size":"1014M","used":"363M","avail":"652M","use%":"36%","mounted":"/boot"},{"filesystem":"/dev/mapper/cs-home","size":"3.8T","used":"27G","avail":"3.7T","use%":"1%","mounted":"/home"},{"filesystem":"/dev/sda1","size":"599M","used":"7.3M","avail":"592M","use%":"2%","mounted":"/boot/efi"},{"filesystem":"/dev/loop2","size":"45M","used":"45M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/snapd/23545"},{"filesystem":"/dev/loop1","size":"67M","used":"67M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core24/716"},{"filesystem":"/dev/loop0","size":"64M","used":"64M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core20/2496"},{"filesystem":"/dev/loop6","size":"67M","used":"67M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/core24/739"},{"filesystem":"/dev/loop7","size":"45M","used":"45M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/snapd/23771"},{"filesystem":"/dev/loop4","size":"56M","used":"56M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/certbot/4482"},{"filesystem":"/dev/loop9","size":"56M","used":"56M","avail":"0","use%":"100%","mounted":"/var/lib/snapd/snap/certbot/4557"},{"filesystem":"tmpfs","size":"6.3G","used":"0","avail":"6.3G","use%":"0%","mounted":"/run/user/0"}],
        "temperature": {
            "cpu_temp_celsius": 40.0
        },
        "network": {
            "ip_address": "10.110.100.236",
            "interfaces": "lo,enp7s0f0,enp7s0f1"
        },
        "processes": {
            "total": 402,
            "running": 2
        },
        "users": {
            "logged_in": 1
        },
        "timestamp": "2025-04-12T20:26:43Z"
    }
    ]
  }

  getSystemInfo(): Observable<any> {
    // Si los datos vienen de una API:
    // return this.http.get('tu-api-endpoint');
    
    // Para datos estáticos:
    return new Observable(observer => {
      observer.next(this.systemData);
      observer.complete();
    });
  }
}