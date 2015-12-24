import {Injectable} from 'angular2/core';

var socket = io.connect("localhost:8000");

@Injectable()
export class SocketService {
    public getSocket():SocketIOClient.Socket{
        return socket;
    }
}