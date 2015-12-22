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

app.use('/static',express.static(__dirname+"/public"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection',function(socket){
    console.log('user connected');
    
    socket.on("send-post",function(data){
       console.log(data);
       io.emit("new-post",{title:"Test",text:data.text}); 
    });
});
