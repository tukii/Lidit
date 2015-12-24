import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app.component.js';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {SocketService} from './services/socket.service.js';

bootstrap(AppComponent,[
    ROUTER_PROVIDERS,
    SocketService
]);