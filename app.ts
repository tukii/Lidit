﻿/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/mongodb/mongodb.d.ts" />

import * as express from 'express';
var app = express();
var server = require('http').Server(app);
var io :SocketIO.Server = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('url', function(err, mongodb) {
  if(err){
      console.log("Error connecting to mongo db.")
      console.log(err);
      return;
  }
  db = mongodb;
  console.log("Connected to mongo db.");
});

var insertNewPost = function(post) {
  var collection = db.collection('posts');
  // Insert a post
  collection.insert(post, function(err, result) {
      if(err){
          console.log("error creating new post");
          return;
      }
    console.log("Added new post");
  });
}

var insertNewComment = function(comment) {
  var collection = db.collection('comments');
  // Insert a post
  collection.insert(comment, function(err, result) {
      if(err){
          console.log("error creating new post");
          return;
      }
    console.log("Added new post");
  });
}

var findDocuments = function() {
  var collection = db.collection('posts');
  collection.find({}).toArray(function(err, docs) {
    console.log("Found the following records");
    console.dir(docs)
  });      
}

var getPostsfor = function(ch,callback) {
    var col = db.collection('posts');
    var x = col.find({channel:ch}).toArray(function(err,posts){
        console.log("Sending posts:");
        console.dir(posts);
        callback(posts);
    })
    console.log("x=" +x);
}

var getCommentsfor = function(ch,callback) {
    var col = db.collection('comments');
    col.find({channel:ch}).toArray(function(err,comments){
        console.log("Sending comments:");
        console.dir(comments);
        callback(comments);
    })
}

var port = process.env.port || 8000;

console.log('Starting server...')
server.listen(port);
console.log('Listening on port '+ port);

app.use('/static',express.static(__dirname+"/public"));

app.get('/:whatever', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var postId = 4;
var commentId = 0;
io.on('connection',function(socket){
    
    var username:string = "";
    
    console.log('socketio user connected');
    socket.leaveAll();
    
    //data {ch:"b" text:"text"}
    socket.on("send-post",function(data){
       postId = postId + 1;
       var post = {id:postId,channel:data.channel,text:data.text};
       insertNewPost(post);
       io.to(data.channel).emit("new-post", post); 
    });
    
    //data {channel:"text",postId:5,text:"text"}
    socket.on("send-comment",function(data){
        commentId = commentId+1;
        var comment = {channel:data.channel, postId:data.postId, id:commentId, text:data.text};
        insertNewComment(comment);
        io.to(data.channel).emit("new-comment",comment);
    })
    
    //ch {name:"text"}
    socket.on("join",function(ch){
       if(ValidateString(ch.name)){
           socket.leaveAll();
           socket.join(ch.name);
           getPostsfor(ch.name, posts=> socket.emit('posts', posts));
           getCommentsfor(ch.name, comments => socket.emit('comments', comments));
        }
        else{
            socket.leaveAll();
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