﻿/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/mongodb/mongodb.d.ts" />
/// <reference path="typings/multer/multer.d.ts" />

import * as express from 'express'

var app = express()
var server = require('http').Server(app)
var io :SocketIO.Server = require('socket.io')(server)
var MongoClient = require('mongodb').MongoClient
var marked = require('marked')
var striptags = require('striptags')
var multer = require('multer')
var crypto = require('crypto')
var upload = multer({storage: multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/uploads')
    },
    filename: function(req,file,cb){
        cb(null,'['+Date.now()+'] '+file.originalname)
    }
})})

var db;

var postId = 1;
MongoClient.connect('mongodb://188.166.71.245:27017/data', function(err, mongodb) {
    if(err){
        console.log("Error connecting to mongo db.")
        console.log(err);
        return;
    }
    db = mongodb;
    
    db.collection('postnumber').findOne({}, function(err, doc) {
        postId = doc.post_number;
    });
    
    console.log('connected to mongo');
});

Array.prototype.indexOfAny = function (array) {
    return this.findIndex(function(v) { return array.indexOf(v) != -1; });
}

Array.prototype.containsAny = function (array) {
    return this.indexOfAny(array) != -1;
}

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

var insertNewComment = function(postid, comment) {
  var collection = db.collection('posts');
  
  collection.update({postId:postid},{$push:{comments:comment}})
  console.log("Added new comment");
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
    col.find({channel: ch}).toArray((err, posts) => callback(posts))
}

var getVotesFor = function(ch,callback){
    db.collection('votes').find({channel:ch}).toArray(function(err,votes){
        callback(votes)
    })
}

var deletePost = function(id,callback){
    var col = db.collection('posts');
    col.remove({postId:id},function(){
        console.log('deleted post with id '+id);
        callback()
    })
}

//probably doesn't work
var deleteComment = function(id,callback){
    var col = db.collection('posts');
    col.update({},{$unset:{'comments.commentId':id}},function(){
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

var upvote = function(id,channel,hash,callback){
    var col = db.collection('votes');
    col.find({id:id,channel:channel,hash:hash}).count(function(err,num){
        if(num!=0) {
            callback(true) //yes err
            return
        }
        col.insert({id:id,channel:channel,hash:hash,type:'+'});
        callback(false) // no err
    })
}

var downvote = function(id,channel,hash,callback){
    var col = db.collection('votes');
    col.find({id:id,channel:channel,hash:hash}).count(function(err,num){
        if(num!=0) {
            callback(true)
            return
        }
        col.insert({id:id,channel:channel,hash:hash, type:'-'});
        callback(false)
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
    var col = db.collection('posts');
    col.aggregate([
        {
            $project:{
                count:{$size:"$comments"}
            }
        },
        {
            $group:{
                _id:null,sum:{$sum:"$count"}
            }
        }
    ],(err,result)=>{callback(err,result[0].sum)})
}

var checkChannel = function(ch,onFail){
    var col = db.collection('channels');
    
    //todo fix col.find({abbr: ch.abbr}).count() == 0 
    if(typeof ch.abbr !== "undefined" && typeof ch.abbr === "string" && ch.abbr.length <6 && ch.abbr.length > 0){
        col.insert({abbr:ch.abbr,name:""});
        onFail();
    }
}

var incrementPostNumber = function(){
    ++postId
    db.collection('postnumber').update({},{$inc:{post_number:1}})
}


var port = process.env.port || 8000;

console.log('Starting server...')
server.listen(port);
console.log('Listening on port '+ port);

app.use('/static',express.static(__dirname+"/public"));

app.get('/robots.txt',function(req,res){
    res.sendFile(__dirname + '/public/robots.txt');
});
app.post('/file-upload',upload.single('file'),function(req,res){
   console.dir("Uploaded file:");
   console.dir(req.file);
   res.write(req.file.filename);
   res.status(204).end();
});
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
                })
            })
        })
    })
}

io.on('connection',function(socket){
    var currentChannel = '/'
    var myHash = hash(socket.handshake.address)
    console.log('socketio user connected ' + socket.handshake.address);
    socket.leaveAll();
    //emit all channels
    getChannels(channels=>socket.emit('channels',channels));
    //data {ch:"b" text:"text"}
    
    emitServerStats();
    
    socket.on("send-post",function(data){
       emitServerStats();
       incrementPostNumber()
       var post = {postId:postId,creationDate:new Date(),channel:data.channel,text:striptags(data.text),image:data.image,comments:[]};
       insertNewPost(post);
       io.to(data.channel).emit("new-post", post); 
    });
    
    //data {channel:"text",postId:5,text:"text"}
    socket.on("send-comment",function(data){
        emitServerStats();
        incrementPostNumber()
        var comment = { postId:data.postId,commentId:postId, creationDate:new Date(), channel:data.channel,text:striptags(data.text),image:data.image};
        insertNewComment(data.postId,comment);
        io.to(data.channel).emit("new-comment",comment);
    })
    
    //ch {abbr:"text"}
    socket.on("join",function(ch){
       console.log('joined channel '+ch.abbr);
       if(ValidateString(ch.abbr)){
            socket.leaveAll();
            socket.join(ch.abbr);
            currentChannel = ch.abbr;
            if(db)
            getVotesFor(ch.abbr,upvotes=> {
              getPostsfor(ch.abbr, posts=> {
                posts.forEach(p=>{
                  p.upvotes = p.downvotes = 0;
                  
                    upvotes.forEach(uv => {
                        if(uv.id == p.postId){
                            if(uv.type === '+')
                                p.upvotes++
                            else
                                p.downvotes++
                            if(String(uv.hash) == myHash){
                                p.myVote = uv.type
                            }
                            return
                        }
                        for (var i = 0; i < p.comments.length; i++){
                            var com = p.comments[i];
                            
                            if(typeof com.upvotes === "undefined") com.upvotes = 0
                            if(typeof com.downvotes === "undefined") com.downvotes = 0
                            
                            if(uv.id == com.commentId){
                                if(uv.type === '+')
                                    com.upvotes++
                                else
                                    com.downvotes++
                                if(String(uv.hash) == myHash){
                                    com.myVote = uv.type
                                }
                            }
                        }
                    })
                })
                socket.emit('posts', posts)
                
                emitServerStats();
                });
            })
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
          io.to(currentChannel).emit('post-deleted',{id:data.id})
        })
    })
    
    //data {id:5}
    socket.on('delete-comment',function(data){
        emitServerStats();
        deleteComment(data.postId,()=>{
            io.to(currentChannel).emit('comment-deleted',{postId:data.postId})
        })
    })
    
    socket.on('disconnect',function(){
        console.log("user disconnected");
    })
    
    socket.on('upvote',function(data,callback){
        upvote(data.id,currentChannel,myHash,function(err){
            if(err){
                callback(err) // error!
                return
            }
            callback(err) // no error
            socket.broadcast.to(currentChannel).emit('upvoted',data.id)
        });
    })
    
    socket.on('downvote',function(data,callback){
        downvote(data.id,currentChannel,myHash,function(err){
            if(err){
                callback(err) // error!
                return
            }
            callback(err) // no error
            socket.broadcast.to(currentChannel).emit('downvoted',data.id)
        });
    })
});

function ValidateString(name:any) : boolean{
    return typeof name === "string" && name.length > 0;
}

var salty = 'dc3fc5ccbb5819bbd037';
function hash(data) {
  var hash = crypto.createHash('sha512');
  hash.update(data);
  hash.update(salty);
  return hash.digest();
}

function validHash(hash, data){
    data = data || "";
    hash = hash || "";
    return hash(data) === hash;
}