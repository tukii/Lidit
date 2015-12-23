/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />

import * as express from 'express';
var app = express();
var server = require('http').Server(app);
var io :SocketIO.Server = require('socket.io')(server);

var port = process.env.port || 8000;

console.log('Starting server...')
server.listen(port);
console.log('Listening on port '+ port);

app.use('/static',express.static(__dirname+"/public"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection',function(socket){
    
    var username:string = "";
    
    console.log('user connected');
    socket.leaveAll();
    socket.join("/");
    
    socket.on("send-post",function(data){
       console.log(data);
       io.emit("new-post",{title:"Test",text:data.text}); 
    });
    
    socket.on("join",function(ch){
       if(typeof ch.name === "string"){
           socket.leaveAll();
           socket.join(ch.name);
        }
        else{
            socket.leaveAll();
            socket.join("/");
            io.of("").write
        }
    });
    
    socket.on("change-name",function(data){
        if(typeof data.name === "string" && data.name.length>3)
            username = data.name;
    });
});
