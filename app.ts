/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/mongodb/mongodb.d.ts" />

import * as express from 'express';
var app = express();
var server = require('http').Server(app);
var io :SocketIO.Server = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var marked = require('marked');

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
        posts.map( x => {
            x.text = marked(x.text)
        })
        callback(posts);
    })
}

var getCommentsfor = function(ch,callback) {
    var col = db.collection('comments');
    col.find({channel:ch}).toArray(function(err,comments){
        comments.map( x=> {
            x.text = marked(x.text)
        })
        callback(comments)
    })
}

var deletePost = function(id,callback){
    var col = db.collection('posts');
    col.remove({postId:id},function(){
        console.log('deleted post with id '+id);
        callback()
    })
}

var deleteComment = function(id,callback){
    var col = db.collection('comments');
    col.remove({commentId:id},function(){
        console.log('deleted comment with id '+id);
        callback()
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
    if(typeof ch.abbr !== "undefined" && typeof ch.abbr === "string" && ch.abbr.length <6 && ch.abbr.length > 0){
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

var emitServerStats = function(){
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
}

io.on('connection',function(socket){
    console.log('socketio user connected ' + socket.handshake.address);
    socket.leaveAll();
    //emit all channels
    getChannels(channels=>socket.emit('channels',channels));
    //data {ch:"b" text:"text"}
    
    emitServerStats();
    
    socket.on("send-post",function(data){
       emitServerStats();
       postId = postId + 1;
       var post = {postId:postId,creationDate:new Date(),channel:data.channel,text:data.text};
       insertNewPost(post);
       post.text = marked(post.text)
       io.to(data.channel).emit("new-post", post); 
    });
    
    //data {channel:"text",postId:5,text:"text"}
    socket.on("send-comment",function(data){
        emitServerStats();
        commentId = commentId+1;
        var comment = { commentId:commentId, creationDate:new Date(), channel:data.channel, postId:data.postId,text:data.text};
        insertNewComment(comment);
        comment.text = marked(comment.text);
        io.to(data.channel).emit("new-comment",comment);
    })
    
    //ch {abbr:"text"}
    socket.on("join",function(ch){
        emitServerStats();
       console.log('joined channel '+ch.abbr);
       if(ValidateString(ch.abbr)){
           socket.leaveAll();
           socket.join(ch.abbr);
           //checkChannel(ch,() => {socket.emit('new-channel',{abbr:ch.abbr})});
           getPostsfor(ch.abbr, posts=> {
               socket.emit('posts', posts)
               getCommentsfor(ch.abbr, comments => socket.emit('comments', comments));    
            });
        }
        else{
            socket.leaveAll();
        }
    });
    
    //data {id:5}
    socket.on('delete-post',function(data){
        emitServerStats();
        deletePost(data.id,() => {
          deleteComment(data.id,()=>{})
          io.emit('post-deleted',{id:data.id})
        })
    })
    
    //data {id:5}
    socket.on('delete-comment',function(data){
        emitServerStats();
        deleteComment(data.commentId,()=>{
            io.emit('comment-deleted',{postId:data.postId, commentId:data.commentId})
        })
    })
    
    socket.on('disconnect',function(){
        console.log("user disconnected");
    })
});

function ValidateString(name:any) : boolean{
    return typeof name === "string" && name.length > 0;
}