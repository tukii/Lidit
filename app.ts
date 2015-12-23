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

var postId = 0;
var commentId = 0;
io.on('connection',function(socket){
    
    var username:string = "";
    
    console.log('user connected');
    socket.leaveAll();
    socket.join("/");
    
    //data {ch:"b" text:"text"}
    socket.on("send-post",function(data){
       console.log(data);
       io.emit("new-post",{title:"Test",text:data.text}); 
    });
    
    //data {channel:"text",postId:5,text:"text"}
    socket.on("send-comment",function(data){
        io.of(data.channel).emit("new-comment",{text:data.text});
    })
    
    //ch {name:"text"}
    socket.on("join",function(ch){
       if(ValidateString(ch.name)){
           socket.leaveAll();
           socket.join(ch.name);
        }
        else{
            socket.leaveAll();
            socket.join("/");
            io.of("").write
        }
    });
    
    //ch {name:"text"}
    socket.on("change-name",function(data){
        if(ValidateString(data.name) && data.name.length>3)
            username = data.name;
    });
});

function ValidateString(name:any) : boolean{
    return typeof name === "string";
}