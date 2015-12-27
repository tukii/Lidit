/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/mongodb/mongodb.d.ts" />

import * as express from 'express';
var app = express();
var server = require('http').Server(app);
var io :SocketIO.Server = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;

var db;

var postId = 1;
var commentId = 1;
MongoClient.connect('mongodb://188.166.71.245:27017/data', function(err, mongodb) {
    if(err){
        console.log("Error connecting to mongo db.")
        console.log(err);
        return;
    }
    db = mongodb;
    
    var options = { "sort": [['postId','desc']] };
    db.collection('posts').findOne({}, options , function(err, doc) {
        if(err || doc==null)return;
        postId = doc.postId;
    });
    
    var options = { "sort": [['commentId','desc']] };
    db.collection('comments').findOne({}, options , function(err, doc) {
        if(err || doc==null)return;
        commentId = doc.commentId;
    });
    console.log('connected to mongo');
});

var insertNewPost = function(post) {
  var collection = db.collection('posts');
  
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
  
  collection.insert(comment, function(err, result) {
      if(err){
          console.log("error creating new comment");
          return;
      }
    console.log("Added new comment");
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
    col.find({channel:ch}).toArray(function(err,posts){
        callback(posts);
    })
}

var getCommentsfor = function(ch,callback) {
    var col = db.collection('comments');
    col.find({channel:ch}).toArray(function(err,comments){
        callback(comments);
    })
}

var getChannels = function(callback){
    var col = db.collection('channels');
    col.find({}).toArray(function(err,channels){
        callback(channels);
    })
}

var getChannelCount = function(callback){
    var col = db.collection('channels');
    col.find({}).count(callback);
}
var getPostCount = function(callback){
    var col = db.collection('posts');
    col.find({}).count(callback);
}
var getCommentCount = function(callback){
    var col = db.collection('comments');
    col.find({}).count(callback);
}

var checkChannel = function(ch,onFail){
    var col = db.collection('channels');
    
    //todo fix col.find({abbr: ch.abbr}).count() == 0 
    if(typeof ch.abbr !== "undefined" && typeof ch.abbr === "string" && ch.abbr.length <6){
        col.insert({abbr:ch.abbr,name:""});
        onFail();
    }
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


//send server stats
setInterval(function(){
    getPostCount(function(err,postCnt){
        getChannelCount(function(err,channelCount){
            getCommentCount(function(err,commentCount){
                io.emit('server-stats',{
                    posts: postCnt,
                    comments: commentCount,
                    channels: channelCount,
                    users: io.sockets.sockets.length
                });
            });
        });
    });
},500);

io.on('connection',function(socket){
    console.log('socketio user connected ' + socket.handshake.address);
    socket.leaveAll();
    //emit all channels
    getChannels(channels=>socket.emit('channels',channels));
    //data {ch:"b" text:"text"}
    socket.on("send-post",function(data){
       postId = postId + 1;
       var post = {postId:postId,creationDate:new Date(),channel:data.channel,text:data.text};
       insertNewPost(post);
       io.to(data.channel).emit("new-post", post); 
    });
    
    //data {channel:"text",postId:5,text:"text"}
    socket.on("send-comment",function(data){
        commentId = commentId+1;
        var comment = { commentId:commentId, creationDate:new Date(), channel:data.channel, postId:data.postId,text:data.text};
        insertNewComment(comment);
        io.to(data.channel).emit("new-comment",comment);
    })
    
    //ch {abbr:"text"}
    socket.on("join",function(ch){
       console.log('joined channel '+ch.abbr);
       if(ValidateString(ch.abbr)){
           socket.leaveAll();
           socket.join(ch.abbr);
           //checkChannel(ch,() => {socket.emit('new-channel',{abbr:ch.abbr})});
           getPostsfor(ch.abbr, posts=> socket.emit('posts', posts));
           getCommentsfor(ch.abbr, comments => socket.emit('comments', comments));
        }
        else{
            socket.leaveAll();
        }
    });
    socket.on('disconnect',function(){
        console.log("user disconnected");
    })
});

function ValidateString(name:any) : boolean{
    return typeof name === "string";
}