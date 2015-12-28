/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component, OnInit, OnDestroy} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {SocketService} from './services/socket.service.js';
import {AddPostComponent} from './add-post.component.js';
import {Post, Comment} from './services/post.service.js';

@Component({
    templateUrl: "static/views/posts.html",
    directives: [AddPostComponent]
})
export class PostsComponent implements OnInit, OnDestroy {
    socket: SocketIOClient.Socket;
    ch:string;
    commentText:string = "";
    posts:Array<Post> = [];
    
    constructor(
        private _routeParams: RouteParams,
        private _socketService: SocketService){
            
        this.socket = this._socketService.getSocket();
    }
    
    ngOnInit(){
        this.ch = this._routeParams.get('ch');
        
        this.socket.on('new-post', data => {
            this.AddPost(new Post(data.postId, data.text, new Date(data.creationDate),[]));
        });
        
        this.socket.on('new-comment', data => this.AddComment(data));
        
        this.socket.on('comments', arr => {
            arr.forEach(data=> this.AddComment(data));
        });
        
        this.socket.on('posts', arr => {
            this.posts = [];
            arr.forEach(data => this.AddPost(new Post(data.postId, data.text,new Date(data.creationDate || null),[])))
        });
        
        this.socket.on('post-deleted',data=>{
            for (var i = 0; i < this.posts.length; i++) {
                if(this.posts[i].postId == data.id){
                    this.posts.splice(i,1)
                    return;
                }
            }
        })
        
        this.socket.on('comment-deleted', data =>{
            for (var i = 0; i < this.posts.length; i++) {
                var element = this.posts[i];
                if(element.postId == data.postId){
                    console.log('found that post')
                    for (var j = 0; j < element.comments.length; j++) {
                        var comm = element.comments[j];
                        if(comm.commentId==data.commentId){
                            element.comments.splice(j,1);
                            break;
                        }
                    }
                    return;
                }
            }
        })
        
        this.socket.emit('join',{abbr:this.ch});
    }
    
    ngOnDestroy(){
        this.socket.removeAllListeners();
    }
    
    public AddComment(data){
        for(var i = 0; i <this.posts.length;i++){
            if(this.posts[i].postId == data.postId){
                //todo create comment instance
                this.posts[i].AddComment(new Comment(data.commentId,data.text, new Date(data.creationDate || null)));
                this.posts.unshift(this.posts[i]);
                this.posts.splice(i+1,1);
                return;
            }
        }
    }
    
    public AddPost(post: Post) {
        if (this.posts.length == 0) {
            this.posts.push(post);
            return;
        }
        this.posts.splice(1, 0, post);
    }
    
    public ToggleComments(post: Post) {
        post.areCommentsVisible = !post.areCommentsVisible;
        for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i] == post) continue;
            this.posts[i].areCommentsVisible = false;
        }
        this.commentText = "";
    }
    
    public SendComment(postId:number) {
        if (this.commentText.trim() === "") return;
        this.socket.emit("send-comment",{text:this.commentText,postId:postId,channel:this.ch});
        this.commentText="";
    }
    
    public deletePost(id:number){
        this.socket.emit('delete-post',{id:id})
    }
    
    public deleteComment(pid:number,cid:number){
        this.socket.emit('delete-comment',{postId:pid,commentId:cid})
    }
}