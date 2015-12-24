/// <reference path="../../../typings/socket.io/socket.io-client.d.ts" />
import {Injectable} from 'angular2/core';

@Injectable()
export class SocketService {
    socket:SocketIOClient.Socket;
    
    constructor(){
        this.socket = io.connect("localhost:8000");
    }
    public getSocket():SocketIOClient.Socket{
        return this.socket;
    }
}