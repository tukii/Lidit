/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />

import * as express from 'express';
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = process.env.port || 8000;

console.log('Starting server...')
server.listen(port);
console.log('Listening on port '+ port);

//app.use(express.static(__dirname+"/views"));
app.use('/static',express.static(__dirname+"/public"));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/{lid}', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection',function(socket){
    console.log('received');
    setInterval(()=>socket.emit('new-post',{title:"Post "+Math.random()*10000000,text:"Text Text Text Text Text Text Text Text Text Text Text Text Text Text .." }),5000);
});/**/