﻿/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component, OnInit} from 'angular2/core';
import {Router, RouteConfig, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {PostsComponent} from './posts.component.js';
import {SocketService} from './services/socket.service.js';

@Component({
    selector: 'lidit-app',
    templateUrl: '/static/views/main.html',
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    {path:"/:ch", name: 'ChannelPage', component:PostsComponent}
])
export class AppComponent implements OnInit {
    channels: Array<Channel>;
    socket: SocketIOClient.Socket;
    stats:any = {};
    
    constructor(
        private _router: Router,
        private _socketService: SocketService) {
        //TODO get channels from the server
        this.channels = [new Channel("random","b"), new Channel("anime","a"),new Channel("music","m")];
    }
    
    public ngOnInit(){
        this.socket = this._socketService.getSocket();
        this.socket.on('connect',() => {
            console.log('connected');
        });
        this.socket.on('channels',arr=>{
           this.channels=[];
            arr.forEach(function(chan){
                this.channels.push(new Channel(chan.name || "",chan.abbr));
            }.bind(this));
        });
        this.socket.on('new-channel',chan=>{
           this.channels.push(new Channel(chan.name || "",chan.abbr)); 
        });
        this.socket.on('server-stats',stats=>this.stats=stats);
    }
    
    public onSelect(ch:Channel) : void {
        this._router.navigate(['ChannelPage',{ch: ch.Abbrevation}]);
    }
}

class Channel {
    Name:string;
    Abbrevation:string;
    constructor(name:string, abbrevation:string) {
        this.Name = name;
        this.Abbrevation = abbrevation;
    }
}